package com.loksewa.aiapp

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.loksewa.aiapp.data.remote.GoogleAuthClient
import com.loksewa.aiapp.ui.screens.LoksewaLearningProvider
import com.loksewa.aiapp.ui.screens.ReferenceAiTutorScreen
import com.loksewa.aiapp.ui.screens.ReferenceAnalyticsScreen
import com.loksewa.aiapp.ui.screens.ReferenceBookmarksScreen
import com.loksewa.aiapp.ui.screens.ReferenceBottomNav
import com.loksewa.aiapp.ui.screens.ReferenceGetStartedScreen
import com.loksewa.aiapp.ui.screens.ReferenceHomeScreen
import com.loksewa.aiapp.ui.screens.ReferenceLoginScreen
import com.loksewa.aiapp.ui.screens.ReferenceMockTestsScreen
import com.loksewa.aiapp.ui.screens.ReferenceNotificationDetailScreen
import com.loksewa.aiapp.ui.screens.ReferenceNotificationsScreen
import com.loksewa.aiapp.ui.screens.ReferenceOnboardingScreen
import com.loksewa.aiapp.ui.screens.ReferencePracticeQuestionScreen
import com.loksewa.aiapp.ui.screens.ReferenceProfileDetailScreen
import com.loksewa.aiapp.ui.screens.ReferenceProfileScreen
import com.loksewa.aiapp.ui.screens.ReferenceQuestionResultScreen
import com.loksewa.aiapp.ui.screens.ReferenceSignUpScreen
import com.loksewa.aiapp.ui.screens.ReferenceSplashScreen
import com.loksewa.aiapp.ui.screens.ReferenceStudyMaterialsScreen
import com.loksewa.aiapp.ui.screens.ReferenceTestResultScreen
import com.loksewa.aiapp.ui.screens.rememberLoksewaLearningState

sealed class Screen(val route: String) {
    data object Splash : Screen("splash")
    data object OnboardingOne : Screen("onboarding_1")
    data object OnboardingTwo : Screen("onboarding_2")
    data object GetStarted : Screen("get_started")
    data object Login : Screen("login")
    data object Register : Screen("register")
    data object Home : Screen("home")
    data object MockTests : Screen("mock_tests")
    data object PracticeQuestion : Screen("practice_question")
    data object QuestionResult : Screen("question_result")
    data object TestResult : Screen("test_result")
    data object Analytics : Screen("analytics")
    data object AiTutor : Screen("ai_tutor")
    data object Study : Screen("study")
    data object Bookmarks : Screen("bookmarks")
    data object Notifications : Screen("notifications")
    object NotificationDetail : Screen("notification_detail/{notificationId}") {
        fun createRoute(notificationId: Int) = "notification_detail/$notificationId"
    }
    object ProfileDetail : Screen("profile_detail/{section}") {
        fun createRoute(section: String) = "profile_detail/$section"
    }
    data object Profile : Screen("profile")
}

@Composable
fun LoksewaApp() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val context = LocalContext.current
    val learningState = rememberLoksewaLearningState()

    LaunchedEffect(Unit) {
        GoogleAuthClient.cachedSession(context)?.let(learningState::applySession)
    }

    val bottomRoutes = setOf(
        Screen.Home.route,
        Screen.MockTests.route,
        Screen.Study.route,
        Screen.Bookmarks.route,
        Screen.Analytics.route,
        Screen.Profile.route
    )

    fun goMain(route: String) {
        navController.navigate(route) {
            popUpTo(navController.graph.findStartDestination().id) {
                saveState = true
            }
            launchSingleTop = true
            restoreState = true
        }
    }

    LoksewaLearningProvider(state = learningState) {
        Scaffold(
            bottomBar = {
                if (currentRoute in bottomRoutes) {
                    ReferenceBottomNav(
                        currentRoute = currentRoute,
                        onHome = { goMain(Screen.Home.route) },
                        onTests = { goMain(Screen.MockTests.route) },
                        onStudy = { goMain(Screen.Study.route) },
                        onAnalytics = { goMain(Screen.Analytics.route) },
                        onProfile = { goMain(Screen.Profile.route) }
                    )
                }
            }
        ) { paddingValues ->
            NavHost(
                navController = navController,
                startDestination = Screen.Splash.route,
                modifier = Modifier.padding(paddingValues)
            ) {
                composable(Screen.Splash.route) {
                    ReferenceSplashScreen(
                        onDone = {
                            navController.navigate(
                                if (learningState.isSignedIn) Screen.Home.route else Screen.OnboardingOne.route
                            ) {
                                popUpTo(Screen.Splash.route) { inclusive = true }
                            }
                        }
                    )
                }

                composable(Screen.OnboardingOne.route) {
                    ReferenceOnboardingScreen(
                        step = 1,
                        onNext = { navController.navigate(Screen.OnboardingTwo.route) },
                        onSkip = { navController.navigate(Screen.GetStarted.route) }
                    )
                }

                composable(Screen.OnboardingTwo.route) {
                    ReferenceOnboardingScreen(
                        step = 2,
                        onNext = { navController.navigate(Screen.GetStarted.route) },
                        onSkip = { navController.navigate(Screen.GetStarted.route) }
                    )
                }

                composable(Screen.GetStarted.route) {
                    ReferenceGetStartedScreen(
                        onBack = { navController.popBackStack() },
                        onEmail = { navController.navigate(Screen.Login.route) },
                        onGoogle = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(Screen.GetStarted.route) { inclusive = true }
                            }
                        },
                        onApple = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(Screen.GetStarted.route) { inclusive = true }
                            }
                        }
                    )
                }

                composable(Screen.Login.route) {
                    ReferenceLoginScreen(
                        onLogin = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(Screen.GetStarted.route) { inclusive = true }
                            }
                        },
                        onRegister = { navController.navigate(Screen.Register.route) }
                    )
                }

                composable(Screen.Register.route) {
                    ReferenceSignUpScreen(
                        onSignUp = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(Screen.GetStarted.route) { inclusive = true }
                            }
                        },
                        onLogin = { navController.popBackStack() }
                    )
                }

                composable(Screen.Home.route) {
                    ReferenceHomeScreen(
                        onMockTests = { goMain(Screen.MockTests.route) },
                        onPractice = { navController.navigate(Screen.PracticeQuestion.route) },
                        onStudy = { goMain(Screen.Study.route) },
                        onBookmarks = { goMain(Screen.Bookmarks.route) },
                        onTutor = { navController.navigate(Screen.AiTutor.route) },
                        onAnalytics = { goMain(Screen.Analytics.route) },
                        onProfile = { goMain(Screen.Profile.route) },
                        onNotifications = { navController.navigate(Screen.Notifications.route) }
                    )
                }

                composable(Screen.MockTests.route) {
                    ReferenceMockTestsScreen(
                        onStartPractice = { navController.navigate(Screen.PracticeQuestion.route) }
                    )
                }

                composable(Screen.PracticeQuestion.route) {
                    ReferencePracticeQuestionScreen(
                        onBack = { navController.popBackStack() },
                        onResult = { navController.navigate(Screen.QuestionResult.route) }
                    )
                }

                composable(Screen.QuestionResult.route) {
                    ReferenceQuestionResultScreen(
                        onBack = { navController.popBackStack() },
                        onNext = { navController.navigate(Screen.TestResult.route) }
                    )
                }

                composable(Screen.TestResult.route) {
                    ReferenceTestResultScreen(
                        onAnalytics = { goMain(Screen.Analytics.route) },
                        onReview = { navController.navigate(Screen.PracticeQuestion.route) }
                    )
                }

                composable(Screen.Analytics.route) {
                    ReferenceAnalyticsScreen()
                }

                composable(Screen.AiTutor.route) {
                    ReferenceAiTutorScreen(onBack = { navController.popBackStack() })
                }

                composable(Screen.Study.route) {
                    ReferenceStudyMaterialsScreen(
                        onBookmarks = { navController.navigate(Screen.Bookmarks.route) }
                    )
                }

                composable(Screen.Bookmarks.route) {
                    ReferenceBookmarksScreen()
                }

                composable(Screen.Notifications.route) {
                    ReferenceNotificationsScreen(
                        onBack = { navController.popBackStack() },
                        onOpenDetail = { notificationId ->
                            navController.navigate(Screen.NotificationDetail.createRoute(notificationId))
                        }
                    )
                }

                composable(
                    route = Screen.NotificationDetail.route,
                    arguments = listOf(navArgument("notificationId") { type = NavType.IntType })
                ) { backStackEntry ->
                    ReferenceNotificationDetailScreen(
                        notificationId = backStackEntry.arguments?.getInt("notificationId") ?: 1,
                        onBack = { navController.popBackStack() },
                        onPractice = { navController.navigate(Screen.PracticeQuestion.route) },
                        onAnalytics = { goMain(Screen.Analytics.route) }
                    )
                }

                composable(Screen.Profile.route) {
                    ReferenceProfileScreen(
                        onOpenDetail = { section ->
                            navController.navigate(Screen.ProfileDetail.createRoute(section))
                        },
                        onLogout = {
                            navController.navigate(Screen.GetStarted.route) {
                                popUpTo(Screen.Home.route) { inclusive = true }
                            }
                        }
                    )
                }

                composable(
                    route = Screen.ProfileDetail.route,
                    arguments = listOf(navArgument("section") { type = NavType.StringType })
                ) { backStackEntry ->
                    ReferenceProfileDetailScreen(
                        section = backStackEntry.arguments?.getString("section") ?: "settings",
                        onBack = { navController.popBackStack() }
                    )
                }
            }
        }
    }
}
