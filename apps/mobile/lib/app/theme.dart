// Loksewa AI — Modern Design System
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

/// Loksewa AI — Complete Design System
/// Inspired by Duolingo's playfulness + Apple's polish
class AppTheme {
  // ===== Brand Colors =====
  static const Color primary = Color(0xFF146BFF);
  static const Color primaryLight = Color(0xFF12D8FF);
  static const Color primaryDark = Color(0xFF063A9E);
  static const Color primaryContainer = Color(0x26146BFF);

  static const Color secondary = Color(0xFFFF8A00);
  static const Color secondaryLight = Color(0xFFFFC400);
  static const Color secondaryContainer = Color(0xFFFFE8D1);

  static const Color tertiary = Color(0xFF6366F1); // Indigo accent
  static const Color tertiaryContainer = Color(0xFFE0E2FF);

  // ===== Semantic Colors =====
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // ===== Neutral Colors =====
  static const Color white = Colors.white;
  static const Color background = Color(0xFF020713);
  static const Color surface = Color(0xFF071426);
  static const Color surfaceVariant = Color(0xFF0B1A2D);
  static const Color outline = Color(0x337896BE);
  static const Color textPrimary = Color(0xFFF7FAFF);
  static const Color textSecondary = Color(0xFFA7B4C8);
  static const Color textTertiary = Color(0xFF6F7D91);

  // ===== Dark Theme Colors =====
  static const Color darkBackground = Color(0xFF020713);
  static const Color darkSurface = Color(0xFF071426);
  static const Color darkSurfaceVariant = Color(0xFF0B1A2D);
  static const Color darkOutline = Color(0x337896BE);
  static const Color darkTextPrimary = Color(0xFFF7FAFF);
  static const Color darkTextSecondary = Color(0xFFA7B4C8);

  // ===== Gradients =====
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF146BFF), Color(0xFF12D8FF), Color(0xFFFF8A00), Color(0xFFFFC400)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient secondaryGradient = LinearGradient(
    colors: [Color(0xFFFF8A00), Color(0xFFFFC400)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient purpleGradient = LinearGradient(
    colors: [Color(0xFF8B5CF6), Color(0xFF6366F1)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient blueGradient = LinearGradient(
    colors: [Color(0xFF146BFF), Color(0xFF12D8FF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient pinkGradient = LinearGradient(
    colors: [Color(0xFFEC4899), Color(0xFFF43F5E)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF020713), Color(0xFF146BFF), Color(0xFFFF8A00)],
    stops: [0.0, 0.5, 1.0],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ===== Shadows =====
  static List<BoxShadow> get cardShadow => [
        BoxShadow(
          color: Colors.black.withOpacity(0.04),
          blurRadius: 10,
          offset: const Offset(0, 4),
        ),
      ];

  static List<BoxShadow> get elevatedShadow => [
        BoxShadow(
          color: Colors.black.withOpacity(0.08),
          blurRadius: 20,
          offset: const Offset(0, 8),
        ),
      ];

  static List<BoxShadow> get primaryShadow => [
        BoxShadow(
          color: primary.withOpacity(0.3),
          blurRadius: 20,
          offset: const Offset(0, 8),
        ),
      ];

  // ===== Spacing =====
  static const double space2 = 2;
  static const double space4 = 4;
  static const double space6 = 6;
  static const double space8 = 8;
  static const double space12 = 12;
  static const double space16 = 16;
  static const double space20 = 20;
  static const double space24 = 24;
  static const double space32 = 32;
  static const double space40 = 40;
  static const double space48 = 48;
  static const double space64 = 64;

  // ===== Radius =====
  static const double radius8 = 8;
  static const double radius12 = 12;
  static const double radius16 = 16;
  static const double radius20 = 20;
  static const double radius24 = 24;
  static const double radius32 = 32;
  static const double radiusFull = 999;

  // ===== Animation Durations =====
  static const Duration fast = Duration(milliseconds: 200);
  static const Duration normal = Duration(milliseconds: 300);
  static const Duration slow = Duration(milliseconds: 500);
  static const Duration verySlow = Duration(milliseconds: 800);

  /// Returns light theme
  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme.light(
        primary: primary,
        onPrimary: white,
        primaryContainer: primaryContainer,
        onPrimaryContainer: primaryDark,
        secondary: secondary,
        onSecondary: white,
        secondaryContainer: secondaryContainer,
        onSecondaryContainer: Color(0xFF8B4500),
        tertiary: tertiary,
        onTertiary: white,
        tertiaryContainer: tertiaryContainer,
        error: error,
        onError: white,
        surface: surface,
        onSurface: textPrimary,
        surfaceContainerHighest: surfaceVariant,
        onSurfaceVariant: textSecondary,
        outline: outline,
        outlineVariant: Color(0xFFCBD5E1),
      ),
      scaffoldBackgroundColor: background,
      fontFamily: GoogleFonts.inter().fontFamily,
      textTheme: _buildTextTheme(textPrimary, textSecondary),
      appBarTheme: AppBarTheme(
        backgroundColor: background,
        foregroundColor: textPrimary,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: textPrimary,
        ),
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
        ),
      ),
      elevatedButtonTheme: _buildElevatedButtonTheme(),
      outlinedButtonTheme: _buildOutlinedButtonTheme(),
      textButtonTheme: _buildTextButtonTheme(),
      cardTheme: _buildCardTheme(),
      inputDecorationTheme: _buildInputDecorationTheme(),
      bottomNavigationBarTheme: _buildBottomNavTheme(),
      navigationBarTheme: _buildNavigationBarTheme(),
      chipTheme: _buildChipTheme(),
      dialogTheme: _buildDialogTheme(),
      bottomSheetTheme: _buildBottomSheetTheme(),
      snackBarTheme: _buildSnackBarTheme(),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: primary,
        linearTrackColor: Color(0xFFE2E8F0),
        circularTrackColor: Color(0xFFE2E8F0),
      ),
      dividerTheme: const DividerThemeData(
        color: outline,
        thickness: 1,
        space: 1,
      ),
      iconTheme: const IconThemeData(color: textPrimary),
      sliderTheme: const SliderThemeData(
        activeTrackColor: primary,
        inactiveTrackColor: outline,
        thumbColor: primary,
        overlayColor: Color(0x331F8852),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return primary;
          return Colors.white;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return primaryLight;
          return outline;
        }),
      ),
      tabBarTheme: TabBarTheme(
        labelColor: primary,
        unselectedLabelColor: textSecondary,
        indicatorColor: primary,
        indicatorSize: TabBarIndicatorSize.label,
        labelStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  /// Returns dark theme
  static ThemeData get dark {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        primary: primaryLight,
        onPrimary: darkBackground,
        primaryContainer: Color(0xFF13472F),
        onPrimaryContainer: primaryContainer,
        secondary: secondaryLight,
        onSecondary: darkBackground,
        secondaryContainer: Color(0xFF8B4500),
        onSecondaryContainer: secondaryContainer,
        tertiary: Color(0xFF818CF8),
        onTertiary: darkBackground,
        error: Color(0xFFFCA5A5),
        onError: darkBackground,
        surface: darkSurface,
        onSurface: darkTextPrimary,
        surfaceContainerHighest: darkSurfaceVariant,
        onSurfaceVariant: darkTextSecondary,
        outline: darkOutline,
      ),
      scaffoldBackgroundColor: darkBackground,
      fontFamily: GoogleFonts.inter().fontFamily,
      textTheme: _buildTextTheme(darkTextPrimary, darkTextSecondary),
      appBarTheme: AppBarTheme(
        backgroundColor: darkBackground,
        foregroundColor: darkTextPrimary,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: darkTextPrimary,
        ),
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.light,
        ),
      ),
      elevatedButtonTheme: _buildElevatedButtonTheme(isDark: true),
      outlinedButtonTheme: _buildOutlinedButtonTheme(isDark: true),
      textButtonTheme: _buildTextButtonTheme(isDark: true),
      cardTheme: _buildCardTheme(isDark: true),
      inputDecorationTheme: _buildInputDecorationTheme(isDark: true),
      bottomNavigationBarTheme: _buildBottomNavTheme(isDark: true),
      navigationBarTheme: _buildNavigationBarTheme(isDark: true),
      chipTheme: _buildChipTheme(isDark: true),
      dialogTheme: _buildDialogTheme(isDark: true),
      bottomSheetTheme: _buildBottomSheetTheme(isDark: true),
      snackBarTheme: _buildSnackBarTheme(isDark: true),
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: primaryLight,
        linearTrackColor: darkOutline,
        circularTrackColor: darkOutline,
      ),
      dividerTheme: const DividerThemeData(
        color: darkOutline,
        thickness: 1,
        space: 1,
      ),
      iconTheme: const IconThemeData(color: darkTextPrimary),
      tabBarTheme: TabBarTheme(
        labelColor: primaryLight,
        unselectedLabelColor: darkTextSecondary,
        indicatorColor: primaryLight,
        indicatorSize: TabBarIndicatorSize.label,
        labelStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  static TextTheme _buildTextTheme(Color primary, Color secondary) {
    return TextTheme(
      displayLarge: GoogleFonts.inter(
        fontSize: 57,
        fontWeight: FontWeight.w700,
        color: primary,
        height: 1.12,
      ),
      displayMedium: GoogleFonts.inter(
        fontSize: 45,
        fontWeight: FontWeight.w700,
        color: primary,
        height: 1.16,
      ),
      displaySmall: GoogleFonts.inter(
        fontSize: 36,
        fontWeight: FontWeight.w700,
        color: primary,
        height: 1.22,
      ),
      headlineLarge: GoogleFonts.inter(
        fontSize: 32,
        fontWeight: FontWeight.w700,
        color: primary,
        height: 1.25,
      ),
      headlineMedium: GoogleFonts.inter(
        fontSize: 28,
        fontWeight: FontWeight.w700,
        color: primary,
        height: 1.29,
      ),
      headlineSmall: GoogleFonts.inter(
        fontSize: 24,
        fontWeight: FontWeight.w600,
        color: primary,
        height: 1.33,
      ),
      titleLarge: GoogleFonts.inter(
        fontSize: 22,
        fontWeight: FontWeight.w600,
        color: primary,
        height: 1.27,
      ),
      titleMedium: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: primary,
        height: 1.5,
      ),
      titleSmall: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: primary,
        height: 1.43,
      ),
      bodyLarge: GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: primary,
        height: 1.5,
      ),
      bodyMedium: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: primary,
        height: 1.43,
      ),
      bodySmall: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: secondary,
        height: 1.33,
      ),
      labelLarge: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: primary,
        height: 1.43,
      ),
      labelMedium: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w500,
        color: primary,
        height: 1.33,
      ),
      labelSmall: GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        color: secondary,
        height: 1.45,
      ),
    );
  }

  static ElevatedButtonThemeData _buildElevatedButtonTheme({bool isDark = false}) {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        minimumSize: const Size(double.infinity, 56),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radius16),
        ),
        textStyle: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  static OutlinedButtonThemeData _buildOutlinedButtonTheme({bool isDark = false}) {
    return OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: isDark ? darkTextPrimary : textPrimary,
        side: BorderSide(color: isDark ? darkOutline : outline, width: 1.5),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        minimumSize: const Size(double.infinity, 56),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radius16),
        ),
        textStyle: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  static TextButtonThemeData _buildTextButtonTheme({bool isDark = false}) {
    return TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: primary,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        textStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  static CardThemeData _buildCardTheme({bool isDark = false}) {
    return CardThemeData(
      color: isDark ? darkSurface : surface,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radius20),
        side: BorderSide(
          color: isDark ? darkOutline : outline,
          width: 1,
        ),
      ),
    );
  }

  static InputDecorationTheme _buildInputDecorationTheme({bool isDark = false}) {
    return InputDecorationTheme(
      filled: true,
      fillColor: isDark ? darkSurface : white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      hintStyle: GoogleFonts.inter(
        color: textTertiary,
        fontSize: 15,
        fontWeight: FontWeight.w400,
      ),
      labelStyle: GoogleFonts.inter(
        color: isDark ? darkTextSecondary : textSecondary,
        fontSize: 14,
        fontWeight: FontWeight.w500,
      ),
      floatingLabelStyle: GoogleFonts.inter(
        color: primary,
        fontSize: 14,
        fontWeight: FontWeight.w500,
      ),
      prefixIconColor: isDark ? darkTextSecondary : textSecondary,
      suffixIconColor: isDark ? darkTextSecondary : textSecondary,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radius16),
        borderSide: BorderSide(color: isDark ? darkOutline : outline),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radius16),
        borderSide: BorderSide(color: isDark ? darkOutline : outline),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radius16),
        borderSide: const BorderSide(color: primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radius16),
        borderSide: const BorderSide(color: error, width: 1.5),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radius16),
        borderSide: const BorderSide(color: error, width: 2),
      ),
    );
  }

  static BottomNavigationBarThemeData _buildBottomNavTheme({bool isDark = false}) {
    return BottomNavigationBarThemeData(
      backgroundColor: isDark ? darkSurface : surface,
      selectedItemColor: primary,
      unselectedItemColor: isDark ? darkTextSecondary : textSecondary,
      selectedLabelStyle: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w600,
      ),
      unselectedLabelStyle: GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w500,
      ),
      type: BottomNavigationBarType.fixed,
      elevation: 0,
    );
  }

  static NavigationBarThemeData _buildNavigationBarTheme({bool isDark = false}) {
    return NavigationBarThemeData(
      backgroundColor: isDark ? darkSurface : surface,
      indicatorColor: primaryContainer,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return GoogleFonts.inter(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: primaryDark,
          );
        }
        return GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w500,
          color: textSecondary,
        );
      }),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const IconThemeData(color: primary, size: 24);
        }
        return const IconThemeData(color: textSecondary, size: 24);
      }),
      height: 72,
      elevation: 0,
    );
  }

  static ChipThemeData _buildChipTheme({bool isDark = false}) {
    return ChipThemeData(
      backgroundColor: isDark ? darkSurfaceVariant : surfaceVariant,
      labelStyle: GoogleFonts.inter(
        fontSize: 13,
        fontWeight: FontWeight.w500,
        color: isDark ? darkTextPrimary : textPrimary,
      ),
      side: BorderSide(color: isDark ? darkOutline : outline),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radiusFull),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
    );
  }

  static DialogThemeData _buildDialogTheme({bool isDark = false}) {
    return DialogThemeData(
      backgroundColor: isDark ? darkSurface : surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radius24),
      ),
      titleTextStyle: GoogleFonts.inter(
        fontSize: 20,
        fontWeight: FontWeight.w700,
        color: isDark ? darkTextPrimary : textPrimary,
      ),
      contentTextStyle: GoogleFonts.inter(
        fontSize: 15,
        fontWeight: FontWeight.w400,
        color: isDark ? darkTextSecondary : textSecondary,
        height: 1.5,
      ),
    );
  }

  static BottomSheetThemeData _buildBottomSheetTheme({bool isDark = false}) {
    return BottomSheetThemeData(
      backgroundColor: isDark ? darkSurface : surface,
      elevation: 0,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(radius32),
        ),
      ),
      showDragHandle: true,
      dragHandleColor: isDark ? darkOutline : outline,
    );
  }

  static SnackBarThemeData _buildSnackBarTheme({bool isDark = false}) {
    return SnackBarThemeData(
      backgroundColor: isDark ? darkSurfaceVariant : textPrimary,
      contentTextStyle: GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: white,
      ),
      actionTextColor: primaryLight,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radius12),
      ),
    );
  }
}
