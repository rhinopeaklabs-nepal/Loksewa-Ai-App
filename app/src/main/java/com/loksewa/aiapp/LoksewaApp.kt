package com.loksewa.aiapp

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Assignment
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.loksewa.aiapp.camera.CameraScannerManager
import com.loksewa.aiapp.data.local.UserEntity
import com.loksewa.aiapp.data.repository.AuthRepository
import com.loksewa.aiapp.ui.screens.*
import com.loksewa.aiapp.ui.screens.mocktest.*
import com.loksewa.aiapp.ui.screens.result.ResultScreen
import com.loksewa.aiapp.ui.screens.result.ResultViewModel
import com.loksewa.aiapp.ui.screens.scan.ScanScreen
import com.loksewa.aiapp.ui.screens.scan.ScanViewModel
import com.loksewa.aiapp.ui.theme.BorderLight
import com.loksewa.aiapp.ui.theme.BrandViolet
import com.loksewa.aiapp.ui.theme.PrimaryBlue
import com.loksewa.aiapp.ui.theme.PrimaryGlow
import com.loksewa.aiapp.ui.theme.SurfaceLight
import com.loksewa.aiapp.ui.theme.TextSecondaryLight

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Register : Screen("register")
    object Home : Screen("home")
    object Scan : Screen("scan")
    object Result : Screen("result/{questionId}/{sourceValue}") {
        fun createRoute(questionId: Int?, sourceValue: String) = "result/${questionId ?: -1}/$sourceValue"
    }
    object MockTestList : Screen("mock_test_list")
    object TestSession : Screen("test_session/{testId}") {
        fun createRoute(testId: Int) = "test_session/$testId"
    }
    object TestResults : Screen("test_results/{attemptId}") {
        fun createRoute(attemptId: Int) = "test_results/$attemptId"
    }
    object Course : Screen("course")
    object CourseDetail : Screen("course_detail/{courseId}") {
        fun createRoute(courseId: String) = "course_detail/$courseId"
    }
    object LearningFlow : Screen("learning_flow/{courseId}") {
        fun createRoute(courseId: String) = "learning_flow/$courseId"
    }
    object Profile : Screen("profile")
}

@Composable
fun LoksewaApp(
    authRepository: AuthRepository,
    cameraScannerManager: CameraScannerManager
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = currentRoute in listOf(
        Screen.Home.route,
        Screen.MockTestList.route,
        Screen.Course.route,
        Screen.Profile.route
    )

    var isLoggedIn by remember { mutableStateOf(false) }
    var checkingAuth by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        isLoggedIn = authRepository.isLoggedIn()
        checkingAuth = false
    }

    if (checkingAuth) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = PrimaryBlue)
        }
        return
    }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NeuriseBottomBar(
                    currentRoute = currentRoute,
                    onHomeClick = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Home.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    onMockClick = {
                        navController.navigate(Screen.MockTestList.route) {
                            popUpTo(Screen.Home.route)
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    onScanClick = {
                        navController.navigate(Screen.Scan.route)
                    },
                    onCourseClick = {
                        navController.navigate(Screen.Course.route) {
                            popUpTo(Screen.Home.route)
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    onProfileClick = {
                        navController.navigate(Screen.Profile.route) {
                            popUpTo(Screen.Home.route)
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = if (isLoggedIn) Screen.Home.route else Screen.Login.route,
            modifier = Modifier.padding(paddingValues)
        ) {
            composable(Screen.Login.route) {
                val viewModel: LoginViewModel = hiltViewModel()
                LoginScreen(
                    onLoginSuccess = {
                        isLoggedIn = true
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    },
                    onRegisterClick = {
                        navController.navigate(Screen.Register.route)
                    },
                    viewModel = viewModel
                )
            }

            composable(Screen.Register.route) {
                val viewModel: RegisterViewModel = hiltViewModel()
                RegisterScreen(
                    onRegisterSuccess = {
                        isLoggedIn = true
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    },
                    onLoginClick = {
                        navController.popBackStack()
                    },
                    viewModel = viewModel
                )
            }

            composable(Screen.Home.route) {
                val viewModel: HomeViewModel = hiltViewModel()
                val homeState by viewModel.uiState.collectAsState()

                LaunchedEffect(Unit) {
                    viewModel.loadHomeData()
                }

                var cachedUser by remember { mutableStateOf<UserEntity?>(null) }
                LaunchedEffect(Unit) {
                    cachedUser = authRepository.getCachedUser()
                }

                HomeScreen(
                    userName = cachedUser?.fullName ?: "",
                    stats = homeState.stats,
                    scanHistory = homeState.scanHistory,
                    onMockTestClick = { navController.navigate(Screen.MockTestList.route) },
                    onCameraClick = { navController.navigate(Screen.Scan.route) },
                    onProfileClick = { navController.navigate(Screen.Profile.route) },
                    onHistoryItemClick = { questionId, sourceValue ->
                        navController.navigate(Screen.Result.createRoute(questionId, sourceValue))
                    },
                    onClearHistory = { viewModel.clearScanHistory() }
                )
            }

            composable(Screen.Scan.route) {
                val viewModel: ScanViewModel = hiltViewModel()
                ScanScreen(
                    onResultReady = { questionId, sourceValue ->
                        navController.navigate(Screen.Result.createRoute(questionId, sourceValue)) {
                            popUpTo(Screen.Scan.route) { inclusive = true }
                        }
                    },
                    onBackClick = { navController.popBackStack() },
                    cameraScannerManager = cameraScannerManager,
                    viewModel = viewModel
                )
            }

            composable(
                route = Screen.Result.route,
                arguments = listOf(
                    navArgument("questionId") { type = NavType.IntType },
                    navArgument("sourceValue") { type = NavType.StringType }
                )
            ) { backStackEntry ->
                val questionId = backStackEntry.arguments?.getInt("questionId")
                val sourceValue = backStackEntry.arguments?.getString("sourceValue") ?: "uncertain"
                val viewModel: ResultViewModel = hiltViewModel()

                ResultScreen(
                    questionId = if (questionId == -1) null else questionId,
                    sourceValue = sourceValue,
                    onBackClick = { navController.popBackStack() },
                    viewModel = viewModel
                )
            }

            composable(Screen.MockTestList.route) {
                val viewModel: MockTestViewModel = hiltViewModel()
                MockTestListScreen(
                    onTestClick = { testId ->
                        navController.navigate(Screen.TestSession.createRoute(testId))
                    },
                    viewModel = viewModel
                )
            }

            composable(
                route = Screen.TestSession.route,
                arguments = listOf(navArgument("testId") { type = NavType.IntType })
            ) { backStackEntry ->
                val testId = backStackEntry.arguments?.getInt("testId") ?: 1
                val viewModel: MockTestViewModel = hiltViewModel()

                var cachedUser by remember { mutableStateOf<UserEntity?>(null) }
                LaunchedEffect(Unit) {
                    cachedUser = authRepository.getCachedUser()
                }

                TestSessionScreen(
                    testId = testId,
                    userId = cachedUser?.id ?: 1,
                    onSubmitSuccess = { attemptId ->
                        navController.navigate(Screen.TestResults.createRoute(attemptId)) {
                            popUpTo(Screen.TestSession.route) { inclusive = true }
                        }
                    },
                    viewModel = viewModel
                )
            }

            composable(
                route = Screen.TestResults.route,
                arguments = listOf(navArgument("attemptId") { type = NavType.IntType })
            ) { backStackEntry ->
                val attemptId = backStackEntry.arguments?.getInt("attemptId") ?: 1
                val viewModel: MockTestViewModel = hiltViewModel()

                TestResultsScreen(
                    attemptId = attemptId,
                    onHomeClick = {
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Home.route) { inclusive = true }
                        }
                    },
                    viewModel = viewModel
                )
            }

            composable(Screen.Profile.route) {
                ProfileScreen(
                    authRepository = authRepository,
                    onLogoutSuccess = {
                        isLoggedIn = false
                        navController.navigate(Screen.Login.route) {
                            popUpTo(Screen.Home.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Course.route) {
                val viewModel: CourseViewModel = hiltViewModel()
                val courseState by viewModel.uiState.collectAsState()

                LaunchedEffect(Unit) {
                    viewModel.loadCatalog()
                }

                CourseScreen(
                    onStartMockClick = {
                        navController.navigate(Screen.MockTestList.route)
                    },
                    onOpenCourseDetail = { courseId ->
                        navController.navigate(Screen.CourseDetail.createRoute(courseId))
                    },
                    onStartLearning = { courseId ->
                        navController.navigate(Screen.LearningFlow.createRoute(courseId))
                    },
                    uiState = courseState,
                    onLoadCourseDetail = { viewModel.loadCourseDetail(it) }
                )
            }

            composable(
                route = Screen.CourseDetail.route,
                arguments = listOf(navArgument("courseId") { type = NavType.StringType })
            ) { backStackEntry ->
                val courseId = backStackEntry.arguments?.getString("courseId") ?: "gk"
                val viewModel: CourseViewModel = hiltViewModel()
                val courseState by viewModel.uiState.collectAsState()

                LaunchedEffect(courseId) {
                    viewModel.loadCatalog()
                    viewModel.loadCourseDetail(courseId)
                }

                CourseDetailScreen(
                    courseId = courseId,
                    onBackClick = { navController.popBackStack() },
                    onStartLearning = {
                        navController.navigate(Screen.LearningFlow.createRoute(it))
                    },
                    onStartMockClick = {
                        navController.navigate(Screen.MockTestList.route)
                    },
                    uiState = courseState
                )
            }

            composable(
                route = Screen.LearningFlow.route,
                arguments = listOf(navArgument("courseId") { type = NavType.StringType })
            ) { backStackEntry ->
                val courseId = backStackEntry.arguments?.getString("courseId") ?: "gk"
                val viewModel: CourseViewModel = hiltViewModel()
                val courseState by viewModel.uiState.collectAsState()

                LaunchedEffect(courseId) {
                    viewModel.loadCatalog()
                    viewModel.loadCourseDetail(courseId)
                }

                LearningFlowScreen(
                    courseId = courseId,
                    onBackClick = { navController.popBackStack() },
                    onFinish = {
                        navController.navigate(Screen.CourseDetail.createRoute(courseId)) {
                            popUpTo(Screen.Course.route)
                        }
                    },
                    onOpenMock = {
                        navController.navigate(Screen.MockTestList.route)
                    },
                    uiState = courseState
                )
            }
        }
    }
}

@Composable
private fun NeuriseBottomBar(
    currentRoute: String?,
    onHomeClick: () -> Unit,
    onMockClick: () -> Unit,
    onScanClick: () -> Unit,
    onCourseClick: () -> Unit,
    onProfileClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(96.dp)
            .padding(horizontal = 18.dp, vertical = 10.dp)
    ) {
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .height(68.dp)
                .shadow(18.dp, RoundedCornerShape(28.dp), clip = false, ambientColor = BrandViolet.copy(alpha = 0.12f))
                .clip(RoundedCornerShape(28.dp))
                .background(SurfaceLight)
                .border(1.dp, BorderLight, RoundedCornerShape(28.dp))
                .padding(horizontal = 14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            BottomNavAction(
                label = "Home",
                selected = currentRoute == Screen.Home.route,
                icon = Icons.Default.Home,
                onClick = onHomeClick,
                modifier = Modifier.weight(1f)
            )
            BottomNavAction(
                label = "Mocks",
                selected = currentRoute == Screen.MockTestList.route,
                icon = Icons.AutoMirrored.Filled.Assignment,
                onClick = onMockClick,
                modifier = Modifier.weight(1f)
            )
            Spacer(modifier = Modifier.weight(1f))
            BottomNavAction(
                label = "Course",
                selected = currentRoute == Screen.Course.route,
                icon = Icons.Default.School,
                onClick = onCourseClick,
                modifier = Modifier.weight(1f)
            )
            BottomNavAction(
                label = "Profile",
                selected = currentRoute == Screen.Profile.route,
                icon = Icons.Default.Person,
                onClick = onProfileClick,
                modifier = Modifier.weight(1f)
            )
        }

        Box(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .size(66.dp)
                .shadow(16.dp, CircleShape, clip = false, ambientColor = BrandViolet.copy(alpha = 0.24f))
                .clip(CircleShape)
                .background(Brush.linearGradient(listOf(BrandViolet, PrimaryGlow)))
                .clickable(onClick = onScanClick),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.AutoAwesome,
                contentDescription = "Scan with AI",
                tint = SurfaceLight,
                modifier = Modifier.size(30.dp)
            )
        }
    }
}

@Composable
private fun BottomNavAction(
    label: String,
    selected: Boolean,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val color = if (selected) BrandViolet else TextSecondaryLight
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .clickable(onClick = onClick)
            .padding(vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = color,
            modifier = Modifier.size(22.dp)
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            color = color,
            fontSize = 11.sp,
            fontWeight = if (selected) FontWeight.ExtraBold else FontWeight.Medium
        )
    }
}
