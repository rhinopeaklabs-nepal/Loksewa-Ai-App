package com.loksewa.aiapp.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.loksewa.aiapp.ui.components.NeuriseIconButton
import com.loksewa.aiapp.ui.components.NeuriseScreenSurface
import com.loksewa.aiapp.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class ChatMessage(
    val id: String,
    val text: String,
    val isUser: Boolean,
    val time: String = "13:52"
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AiTutorScreen(
    onBackClick: () -> Unit = {}
) {
    val coroutineScope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    var messages by remember {
        mutableStateOf(
            listOf(
                ChatMessage(
                    id = "1",
                    text = "Namaste! I am your AI Loksewa Tutor. I can help you with Nepal's constitution, history, federal structure, and general knowledge questions. What would you like to discuss today?",
                    isUser = false
                )
            )
        )
    }

    var inputText by remember { mutableStateOf("") }
    var isTyping by remember { mutableStateOf(false) }

    val quickCommands = listOf(
        "Explain Federalism in Nepal",
        "Important Rivers of Nepal",
        "MCQ on Constitution"
    )

    fun handleSend(text: String) {
        if (text.isBlank()) return
        val userMsg = ChatMessage(id = System.currentTimeMillis().toString(), text = text, isUser = true)
        messages = messages + userMsg
        inputText = ""

        // Scroll to bottom
        coroutineScope.launch {
            delay(100)
            listState.animateScrollToItem(messages.size - 1)
        }

        // Simulate AI Tutor typing and response
        isTyping = true
        coroutineScope.launch {
            delay(1500)
            isTyping = false

            val replyText = when {
                text.contains("Federalism", ignoreCase = true) -> {
                    "Federalism in Nepal was established by the 2015 Constitution. Nepal is divided into 3 levels of government: Federal, Provincial (7 provinces), and Local (753 local units). This system aims to decentralize power and ensure equal representation for all communities."
                }
                text.contains("Rivers", ignoreCase = true) -> {
                    "Nepal has three major river systems, all flowing from north to south:\n1. Koshi System (Eastern Nepal, longest river system, known as 'Sorrow of Bihar')\n2. Gandaki System (Central Nepal, deepest river)\n3. Karnali System (Western Nepal, longest river inside Nepal).\nThese river basins are rich in hydropower potential."
                }
                text.contains("MCQ", ignoreCase = true) || text.contains("Constitution", ignoreCase = true) -> {
                    "Here is a quick constitutional question for you:\n\n*Which Article of the Constitution of Nepal (2072) defines the executive power of the State?*\n\nOption A: Article 75\nOption B: Article 56\nOption C: Article 85\nOption D: Article 100\n\nType your answer (e.g., Article 75) to see if you are correct!"
                }
                else -> {
                    "That's an interesting question! Based on the Loksewa syllabus, this topic is highly relevant. Let's break it down into key concepts, exam-oriented tips, and practice points. If you need a mock test on this topic, just let me know!"
                }
            }

            val tutorMsg = ChatMessage(
                id = System.currentTimeMillis().toString(),
                text = replyText,
                isUser = false
            )
            messages = messages + tutorMsg

            delay(100)
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    NeuriseScreenSurface {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
        ) {
            // Top Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                NeuriseIconButton(
                    icon = Icons.AutoMirrored.Filled.KeyboardArrowLeft,
                    contentDescription = "Back",
                    onClick = onBackClick
                )
                Spacer(modifier = Modifier.width(14.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Loksewa AI Tutor",
                        color = TextPrimaryLight,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(AccentGreen)
                        )
                        Text(
                            text = "Online Tutor active",
                            color = TextSecondaryLight,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
                
                // Animated Glowing Robot Avatar
                GlowingRobotAvatar()
            }

            // Message list
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 10.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(messages) { message ->
                    ChatBubble(message = message)
                }

                if (isTyping) {
                    item {
                        TypingIndicatorBubble()
                    }
                }
            }

            // Suggestions / Quick Commands
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp)
            ) {
                Text(
                    text = "Quick Commands",
                    color = TextSecondaryLight,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(start = 20.dp, end = 20.dp, bottom = 6.dp)
                )
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    quickCommands.forEach { command ->
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .background(SurfaceWarm)
                                .border(1.dp, BorderLight, RoundedCornerShape(12.dp))
                                .clickable { handleSend(command) }
                                .padding(horizontal = 10.dp, vertical = 12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = command,
                                color = BrandViolet,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.align(Alignment.Center)
                            )
                        }
                    }
                }
            }

            // Bottom Input Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 20.dp, end = 20.dp, bottom = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    placeholder = { Text("Ask a question...", color = TextTertiaryLight) },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(
                        imeAction = ImeAction.Send
                    ),
                    keyboardActions = KeyboardActions(
                        onSend = { handleSend(inputText) }
                    ),
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(24.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BrandViolet,
                        unfocusedBorderColor = BorderLight,
                        focusedContainerColor = SurfaceLight,
                        unfocusedContainerColor = SurfaceLight,
                        cursorColor = BrandViolet,
                        focusedTextColor = TextPrimaryLight,
                        unfocusedTextColor = TextPrimaryLight
                    )
                )

                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .clip(CircleShape)
                        .background(Brush.linearGradient(listOf(BrandViolet, PrimaryGlow)))
                        .clickable { handleSend(inputText) },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Send,
                        contentDescription = "Send",
                        tint = SurfaceLight,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun GlowingRobotAvatar() {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.9f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "avatarScale"
    )
    val glowAlpha by infiniteTransition.animateFloat(
        initialValue = 0.15f,
        targetValue = 0.45f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "glowAlpha"
    )

    Box(contentAlignment = Alignment.Center) {
        // Glowing background ring
        Box(
            modifier = Modifier
                .size(46.dp)
                .scale(scale)
                .clip(CircleShape)
                .background(BrandViolet.copy(alpha = glowAlpha))
        )
        // Main avatar content
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(CircleShape)
                .background(Brush.linearGradient(listOf(BrandViolet, PrimaryGlow))),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.AutoAwesome,
                contentDescription = null,
                tint = SurfaceLight,
                modifier = Modifier.size(18.dp)
            )
        }
    }
}

@Composable
fun ChatBubble(message: ChatMessage) {
    val isUser = message.isUser
    val alignment = if (isUser) Alignment.End else Alignment.Start
    val bg = if (isUser) {
        Brush.linearGradient(listOf(BrandViolet, PrimaryGlow))
    } else {
        Brush.linearGradient(listOf(SurfaceLight, SurfaceLight))
    }
    val textColor = if (isUser) SurfaceLight else TextPrimaryLight
    val bubbleShape = if (isUser) {
        RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp, bottomStart = 16.dp, bottomEnd = 4.dp)
    } else {
        RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp, bottomStart = 4.dp, bottomEnd = 16.dp)
    }

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = alignment
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 290.dp)
                .clip(bubbleShape)
                .then(
                    if (!isUser) Modifier.border(1.dp, BorderLight, bubbleShape) else Modifier
                )
                .background(bg)
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            Text(
                text = message.text,
                color = textColor,
                fontSize = 13.sp,
                lineHeight = 18.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
fun TypingIndicatorBubble() {
    val infiniteTransition = rememberInfiniteTransition(label = "dots")
    val bubbleShape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp, bottomStart = 4.dp, bottomEnd = 16.dp)

    Row(
        modifier = Modifier
            .widthIn(max = 100.dp)
            .clip(bubbleShape)
            .border(1.dp, BorderLight, bubbleShape)
            .background(SurfaceLight)
            .padding(horizontal = 14.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        (0..2).forEach { index ->
            val delayMillis = index * 200
            val alpha by infiniteTransition.animateFloat(
                initialValue = 0.2f,
                targetValue = 1.0f,
                animationSpec = infiniteRepeatable(
                    animation = tween(600, delayMillis = delayMillis, easing = LinearEasing),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "dot$index"
            )
            Box(
                modifier = Modifier
                    .size(6.dp)
                    .clip(CircleShape)
                    .background(BrandViolet.copy(alpha = alpha))
            )
        }
    }
}
