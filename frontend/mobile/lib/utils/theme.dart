import 'package:flutter/material.dart';

/// App Theme Configuration
/// Provides consistent dark theme styling across the application
class AppTheme {
  // Color constants (WaitZero Dynamic Teal Theme)
  static const Color primaryColor = Color(0xFF0D9488); // brand-600
  static const Color primary = Color(0xFF0D9488);      // Alias for primary
  static const Color primaryDark = Color(0xFF0F766E);  // brand-700
  static const Color primaryLight = Color(0xFF2DD4BF); // brand-400
  static const Color secondary = Color(0xFF14B8A6);    // brand-500
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFF43F5E);
  static const Color bgPrimary = Color(0xFF042F2E);    // brand-950
  static const Color bgSecondary = Color(0xFF134E4A);  // brand-900
  static const Color bgCard = Color(0xFF115E59);       // brand-800
  static const Color surface = Color(0xFF115E59);      // Alias for card surface
  static const Color textPrimary = Color(0xFFF0FDFA);  // brand-50
  static const Color textSecondary = Color(0xFFCCFBF1); // brand-100
  static const Color textMuted = Color(0xFF2DD4BF);    // brand-400
  static const Color border = Color(0xFF0F766E);       // brand-700

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: bgPrimary,
      fontFamily: 'Inter',
      colorScheme: const ColorScheme.dark(
        primary: primaryColor,
        secondary: secondary,
        surface: bgSecondary,
        error: danger,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bgSecondary,
        foregroundColor: textPrimary,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardThemeData(
        color: bgCard,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: border),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: bgPrimary,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: primaryColor, width: 2),
        ),
        labelStyle: const TextStyle(color: textSecondary),
        hintStyle: const TextStyle(color: textMuted),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: bgSecondary,
        selectedItemColor: primaryLight,
        unselectedItemColor: textMuted,
      ),
    );
  }
}
