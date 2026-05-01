import 'package:flutter/material.dart';

class InfoPill extends StatelessWidget {
  final String label;
  final Color baseColor;

  const InfoPill({
    super.key,
    required this.label,
    required this.baseColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: baseColor.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: baseColor.withOpacity(0.5)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: baseColor,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
