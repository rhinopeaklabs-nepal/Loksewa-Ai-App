package com.loksewa.aiapp.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.loksewa.aiapp.data.remote.CourseDetailResponse
import com.loksewa.aiapp.data.remote.CourseResponse
import com.loksewa.aiapp.data.remote.LoksewaApiService
import com.loksewa.aiapp.data.remote.SubjectResponse
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CourseUiState(
    val subjects: List<SubjectResponse> = emptyList(),
    val courses: List<CourseResponse> = emptyList(),
    val details: Map<String, CourseDetailResponse> = emptyMap(),
    val loading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class CourseViewModel @Inject constructor(
    private val apiService: LoksewaApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(CourseUiState())
    val uiState: StateFlow<CourseUiState> = _uiState.asStateFlow()

    fun loadCatalog() {
        viewModelScope.launch {
            _uiState.update { it.copy(loading = true, error = null) }
            try {
                val subjectsResponse = apiService.getSubjects()
                val coursesResponse = apiService.getCourses()
                val subjects = if (subjectsResponse.isSuccessful) subjectsResponse.body().orEmpty() else emptyList()
                val courses = if (coursesResponse.isSuccessful) coursesResponse.body().orEmpty() else emptyList()
                _uiState.update {
                    it.copy(
                        subjects = subjects,
                        courses = courses,
                        loading = false,
                        error = if (coursesResponse.isSuccessful) null else "Courses could not be loaded from backend."
                    )
                }
                courses.firstOrNull()?.slug?.let { loadCourseDetail(it) }
            } catch (error: Exception) {
                _uiState.update {
                    it.copy(
                        loading = false,
                        error = error.localizedMessage ?: "Backend learning catalog is unavailable."
                    )
                }
            }
        }
    }

    fun loadCourseDetail(courseId: String) {
        if (_uiState.value.details.containsKey(courseId)) return
        viewModelScope.launch {
            try {
                val response = apiService.getCourseDetail(courseId)
                if (response.isSuccessful) {
                    val detail = response.body()
                    if (detail != null) {
                        _uiState.update {
                            it.copy(details = it.details + (detail.course.slug to detail), error = null)
                        }
                    }
                } else {
                    _uiState.update { it.copy(error = "Course detail could not be loaded.") }
                }
            } catch (error: Exception) {
                _uiState.update {
                    it.copy(error = error.localizedMessage ?: "Course detail is unavailable.")
                }
            }
        }
    }
}
