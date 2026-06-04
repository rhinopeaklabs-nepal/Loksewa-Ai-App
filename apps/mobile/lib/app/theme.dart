import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primary = Color(0xFF3157D5);
  static const Color primaryLight = Color(0xFF7D95FF);
  static const Color primaryDark = Color(0xFF19337F);
  static const Color primarySoft = Color(0xFFE4E9FF);
  static const Color primaryContainer = primarySoft;
  static const Color secondary = Color(0xFF0F9F8C);
  static const Color secondaryLight = Color(0xFF67D8CA);
  static const Color secondarySoft = Color(0xFFDDF8F3);
  static const Color tertiary = Color(0xFF6E63D9);
  static const Color tertiaryContainer = Color(0xFFE9E6FF);
  static const Color accent = Color(0xFFE58A2A);
  static const Color accentSoft = Color(0xFFFFE7C8);
  static const Color secondaryContainer = accentSoft;
  static const Color success = Color(0xFF12805C);
  static const Color warning = Color(0xFFB86E00);
  static const Color error = Color(0xFFC63D45);
  static const Color info = Color(0xFF2674B8);

  static const Color background = Color(0xFFF5F6F1);
  static const Color paper = Color(0xFFFBFCF8);
  static const Color white = paper;
  static const Color surface = Color(0xFFEDEFE8);
  static const Color surfaceVariant = Color(0xFFE2E6DE);
  static const Color ink = Color(0xFF152033);
  static const Color textPrimary = ink;
  static const Color muted = Color(0xFF657083);
  static const Color textSecondary = muted;
  static const Color faint = Color(0xFF9BA4B2);
  static const Color textTertiary = faint;
  static const Color outline = Color(0xFFD6DBD2);

  static const Color darkBackground = Color(0xFF0B0F19); // Rich deep blue/black
  static const Color darkPaper = Color(0xFF111827);      // Premium dark slate
  static const Color darkSurface = Color(0xFF1F2937);    // Dark surface slate
  static const Color darkInk = Color(0xFFF9FAFB);
  static const Color darkMuted = Color(0xFF9CA3AF);
  static const Color darkOutline = Color(0xFF374151);

  // Premium dark mode accents
  static const Color premiumIndigo = Color(0xFF6366F1);
  static const Color premiumEmerald = Color(0xFF10B981);

  static const double radius8 = 8;
  static const double radius12 = 12;
  static const double radius16 = 16;
  static const double radius18 = 18;
  static const double radius20 = 20;
  static const double radius24 = 24;
  static const double radius28 = 28;
  static const double radius32 = 32;
  static const double radiusFull = 999;

  static const Duration fast = Duration(milliseconds: 160);
  static const Duration normal = Duration(milliseconds: 220);

  static const LinearGradient studyGradient = LinearGradient(
    colors: [primary, secondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient warmGradient = LinearGradient(
    colors: [accent, Color(0xFFF4B24E)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient primaryGradient = studyGradient;
  static const LinearGradient secondaryGradient = warmGradient;
  static const LinearGradient blueGradient = LinearGradient(
    colors: [primary, Color(0xFF4AA8D8)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  static const LinearGradient purpleGradient = LinearGradient(
    colors: [tertiary, primary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  static const LinearGradient pinkGradient = LinearGradient(
    colors: [Color(0xFFD9558F), Color(0xFFC63D45)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  static const LinearGradient heroGradient = studyGradient;

  static List<BoxShadow> shadow({Color color = const Color(0x33152033)}) {
    return [
      BoxShadow(
        color: color,
        blurRadius: 24,
        offset: const Offset(0, 12),
      ),
    ];
  }

  static List<BoxShadow> get cardShadow => shadow(color: Colors.black.withOpacity(0.05));
  static List<BoxShadow> get elevatedShadow => shadow(color: Colors.black.withOpacity(0.10));
  static List<BoxShadow> get primaryShadow => shadow(color: primary.withOpacity(0.22));

  static ThemeData get light {
    final base = ColorScheme.fromSeed(
      seedColor: primary,
      brightness: Brightness.light,
    );
    return _theme(
      base.copyWith(
        primary: primary,
        onPrimary: paper,
        primaryContainer: primarySoft,
        onPrimaryContainer: primaryDark,
        secondary: secondary,
        onSecondary: paper,
        secondaryContainer: secondarySoft,
        tertiary: accent,
        tertiaryContainer: accentSoft,
        error: error,
        surface: paper,
        onSurface: ink,
        surfaceContainerHighest: surface,
        onSurfaceVariant: muted,
        outline: outline,
      ),
      scaffold: background,
      text: ink,
      subtext: muted,
      systemOverlayStyle: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
        systemNavigationBarColor: background,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
    );
  }

  static ThemeData get dark {
    final base = ColorScheme.fromSeed(
      seedColor: premiumIndigo,
      brightness: Brightness.dark,
    );
    return _theme(
      base.copyWith(
        primary: premiumIndigo,
        onPrimary: Colors.white,
        primaryContainer: const Color(0xFF312E81),
        onPrimaryContainer: const Color(0xFFE0E7FF),
        secondary: premiumEmerald,
        onSecondary: Colors.white,
        secondaryContainer: const Color(0xFF064E3B),
        onSecondaryContainer: const Color(0xFFD1FAE5),
        tertiary: const Color(0xFFF59E0B), // premium amber
        tertiaryContainer: const Color(0xFF78350F),
        error: const Color(0xFFEF4444),
        surface: darkPaper,
        onSurface: darkInk,
        surfaceContainerHighest: darkSurface,
        onSurfaceVariant: darkMuted,
        outline: darkOutline,
      ),
      scaffold: darkBackground,
      text: darkInk,
      subtext: darkMuted,
      systemOverlayStyle: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        systemNavigationBarColor: darkBackground,
        systemNavigationBarIconBrightness: Brightness.light,
      ),
      isDark: true,
    );
  }

  static ThemeData _theme(
    ColorScheme scheme, {
    required Color scaffold,
    required Color text,
    required Color subtext,
    required SystemUiOverlayStyle systemOverlayStyle,
    bool isDark = false,
  }) {
    final textTheme = GoogleFonts.interTextTheme().apply(
      bodyColor: text,
      displayColor: text,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: scheme.brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: scaffold,
      fontFamily: GoogleFonts.inter().fontFamily,
      textTheme: textTheme.copyWith(
        headlineLarge: textTheme.headlineLarge?.copyWith(
          fontSize: 30,
          height: 1.18,
          fontWeight: FontWeight.w800,
          color: text,
        ),
        headlineMedium: textTheme.headlineMedium?.copyWith(
          fontSize: 25,
          height: 1.22,
          fontWeight: FontWeight.w800,
          color: text,
        ),
        titleLarge: textTheme.titleLarge?.copyWith(
          fontSize: 20,
          height: 1.25,
          fontWeight: FontWeight.w700,
          color: text,
        ),
        titleMedium: textTheme.titleMedium?.copyWith(
          fontSize: 16,
          height: 1.35,
          fontWeight: FontWeight.w700,
          color: text,
        ),
        titleSmall: textTheme.titleSmall?.copyWith(
          fontSize: 14,
          height: 1.35,
          fontWeight: FontWeight.w700,
          color: text,
        ),
        bodyLarge: textTheme.bodyLarge?.copyWith(
          fontSize: 16,
          height: 1.55,
          color: text,
        ),
        bodyMedium: textTheme.bodyMedium?.copyWith(
          fontSize: 14,
          height: 1.5,
          color: text,
        ),
        bodySmall: textTheme.bodySmall?.copyWith(
          fontSize: 12,
          height: 1.45,
          color: subtext,
        ),
        labelLarge: textTheme.labelLarge?.copyWith(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          letterSpacing: 0,
        ),
      ),
      appBarTheme: AppBarTheme(
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        backgroundColor: scaffold,
        foregroundColor: text,
        systemOverlayStyle: systemOverlayStyle,
      ),
      cardTheme: CardThemeData(
        color: scheme.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radius20),
          side: BorderSide(color: scheme.outline),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: scheme.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        hintStyle: TextStyle(color: subtext, fontSize: 14),
        labelStyle: TextStyle(color: subtext, fontWeight: FontWeight.w600),
        prefixIconColor: subtext,
        suffixIconColor: subtext,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radius16),
          borderSide: BorderSide(color: scheme.outline),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radius16),
          borderSide: BorderSide(color: scheme.outline),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radius16),
          borderSide: BorderSide(color: scheme.primary, width: 1.6),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radius16),
          borderSide: BorderSide(color: scheme.error, width: 1.4),
        ),
      ),
      dividerTheme: DividerThemeData(
        color: scheme.outline,
        thickness: 1,
        space: 1,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: isDark ? darkSurface : ink,
        contentTextStyle: TextStyle(color: isDark ? darkInk : paper),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radius12)),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: scheme.surfaceContainerHighest,
        selectedColor: scheme.primaryContainer,
        labelStyle: TextStyle(color: text, fontWeight: FontWeight.w600),
        side: BorderSide(color: scheme.outline),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radius12)),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: scheme.primary,
          foregroundColor: scheme.onPrimary,
          minimumSize: const Size(48, 52),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radius16)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: scheme.onSurface,
          side: BorderSide(color: scheme.outline),
          minimumSize: const Size(48, 52),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radius16)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
        ),
      ),
      iconButtonTheme: IconButtonThemeData(
        style: IconButton.styleFrom(
          minimumSize: const Size(44, 44),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radius14)),
        ),
      ),
    );
  }

  static const double radius14 = 14;

  // GetWidget Custom Colors Mapping (Exposed for easy mapping)
  static Color getGFPrimary(BuildContext context) => Theme.of(context).colorScheme.primary;
  static Color getGFSecondary(BuildContext context) => Theme.of(context).colorScheme.secondary;
  static Color getGFSuccess(BuildContext context) => Theme.of(context).brightness == Brightness.dark ? premiumEmerald : success;
  static Color getGFWarning(BuildContext context) => Theme.of(context).brightness == Brightness.dark ? const Color(0xFFF59E0B) : warning;
  static Color getGFDanger(BuildContext context) => Theme.of(context).brightness == Brightness.dark ? const Color(0xFFEF4444) : error;
  static Color getGFInfo(BuildContext context) => Theme.of(context).colorScheme.primaryContainer;
  static Color getGFDark(BuildContext context) => Theme.of(context).brightness == Brightness.dark ? darkBackground : ink;
  static Color getGFLight(BuildContext context) => Theme.of(context).brightness == Brightness.dark ? darkSurface : background;

  // Glassmorphic Decoration styles
  static BoxDecoration glassDecoration({
    required BuildContext context,
    double opacity = 0.1,
    double borderOpacity = 0.15,
    double borderRadius = radius16,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return BoxDecoration(
      color: (isDark ? Colors.white : Colors.black).withOpacity(opacity),
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: (isDark ? Colors.white : Colors.black).withOpacity(borderOpacity),
        width: 1.0,
      ),
    );
  }

  static LinearGradient glassLinearGradient({required BuildContext context}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    if (isDark) {
      return LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Colors.white.withOpacity(0.1),
          Colors.white.withOpacity(0.05),
        ],
      );
    } else {
      return LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Colors.black.withOpacity(0.05),
          Colors.black.withOpacity(0.01),
        ],
      );
    }
  }

  static LinearGradient glassBorderGradient({required BuildContext context}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    if (isDark) {
      return LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Colors.white.withOpacity(0.2),
          Colors.white.withOpacity(0.05),
        ],
      );
    } else {
      return LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Colors.black.withOpacity(0.1),
          Colors.black.withOpacity(0.02),
        ],
      );
    }
  }
}
