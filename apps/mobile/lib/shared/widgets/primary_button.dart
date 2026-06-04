import 'package:flutter/material.dart';
import 'package:getwidget/getwidget.dart';
import '../../app/theme.dart';

class PrimaryButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final double? width;
  final double height;
  final bool outlined;

  const PrimaryButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.icon,
    this.backgroundColor,
    this.foregroundColor,
    this.width,
    this.height = 56,
    this.outlined = false,
  });

  @override
  Widget build(BuildContext context) {
    final buttonColor = backgroundColor ?? Theme.of(context).colorScheme.primary;
    final onButtonColor = foregroundColor ?? 
        (buttonColor == AppTheme.paper
            ? AppTheme.primary
            : Theme.of(context).colorScheme.onPrimary);

    final gfButton = GFButton(
      onPressed: isLoading ? null : onPressed,
      text: isLoading ? 'Please wait' : text,
      icon: isLoading
          ? const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
            )
          : icon == null
              ? null
              : Icon(icon, size: 18, color: outlined ? buttonColor : onButtonColor),
      size: GFSize.LARGE,
      type: outlined ? GFButtonType.outline : GFButtonType.solid,
      shape: GFButtonShape.pills,
      blockButton: width == null, // Block layout when width is null
      color: buttonColor,
      textColor: outlined ? buttonColor : onButtonColor,
      textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
    );

    if (width == null) return gfButton;
    return SizedBox(width: width, height: height, child: gfButton);
  }
}
