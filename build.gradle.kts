allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val mobileBuildDir: Directory =
    rootProject.layout.projectDirectory
        .dir("apps/mobile/build")
rootProject.layout.buildDirectory.value(mobileBuildDir)

subprojects {
    val subprojectBuildDir: Directory = mobileBuildDir.dir(project.name)
    project.layout.buildDirectory.value(subprojectBuildDir)
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
