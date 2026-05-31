package com.loksewa.aiapp

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Assignment
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
import com.loksewa.aiapp.ui.theme.PrimaryBlue
import com.loksewa.aiapp.ui.theme.SurfaceBlue
import com.loksewa.aiapp.ui.theme.TextSecondary

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
                NavigationBar(
                    containerColor = SurfaceBlue
                ) {
                    NavigationBarItem(
                        selected = currentRoute == Screen.Home.route,
                        onClick = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(Screen.Home.route) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                        label = { Text("Home") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = PrimaryBlue,
                            selectedTextColor = PrimaryBlue,
                            unselectedIconColor = TextSecondary,
                            unselectedTextColor = TextSecondary
                        )
                    )
                    NavigationBarItem(
                        selected = currentRoute == Screen.MockTestList.route,
                        onClick = {
                            navController.navigate(Screen.MockTestList.route) {
                                popUpTo(Screen.Home.route)
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(Icons.AutoMirrored.Filled.Assignment, contentDescription = "Mock Tests") },
                        label = { Text("Mocks") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = PrimaryBlue,
                            selectedTextColor = PrimaryBlue,
                            unselectedIconColor = TextSecondary,
                            unselectedTextColor = TextSecondary
                        )
                    )
                    NavigationBarItem(
                        selected = currentRoute == Screen.Profile.route,
                        onClick = {
                            navController.navigate(Screen.Profile.route) {
                                popUpTo(Screen.Home.route)
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                        label = { Text("Profile") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = PrimaryBlue,
                            selectedTextColor = PrimaryBlue,
                            unselectedIconColor = TextSecondary,
                            unselectedTextColor = TextSecondary
                        )
                    )
                }
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
        }
    }
}