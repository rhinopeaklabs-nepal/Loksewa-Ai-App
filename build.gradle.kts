// Top-level build file — uses Gradle version catalog (gradle/libs.versions.toml)
// AGP 9.x provides built-in Kotlin support (do NOT apply org.jetbrains.kotlin.android).
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.android.library) apply false
    alias(libs.plugins.compose.compiler) apply false
    alias(libs.plugins.hilt) apply false
    alias(libs.plugins.ksp) apply false
}
