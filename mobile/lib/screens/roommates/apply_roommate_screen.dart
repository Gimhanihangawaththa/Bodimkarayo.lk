import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../providers/roommate_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/roommate_model.dart';
import '../../utils/app_notification.dart';

class ApplyRoommateScreen extends StatefulWidget {
  final RoommateModel? existingRoommate;
  const ApplyRoommateScreen({super.key, this.existingRoommate});

  @override
  State<ApplyRoommateScreen> createState() => _ApplyRoommateScreenState();
}

class _ApplyRoommateScreenState extends State<ApplyRoommateScreen> {
  final _formKey = GlobalKey<FormState>();
  final _scrollController = ScrollController();
  String _selectedGender = 'Male';
  final _ageController = TextEditingController();
  final _occupationController = TextEditingController();
  final _locationController = TextEditingController();
  final _bioController = TextEditingController();
  final _aboutController = TextEditingController();
  final _moveInDateController = TextEditingController();
  final _budgetController = TextEditingController();
  final _preferredLocationController = TextEditingController();
  final _preferencesController = TextEditingController();

  final Set<String> _selectedInterests = {};
  bool _isSubmitting = false;

  static const List<String> _allInterests = [
    'Cooking',
    'Reading',
    'Yoga',
    'Writing',
    'Hiking',
    'Photography',
    'Gaming',
    'Music',
    'Sports',
    'Travel',
    'Art',
    'Movies',
    'Fitness',
    'Technology',
    'Gardening',
    'Meditation',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.existingRoommate != null) {
      final rm = widget.existingRoommate!;
      if (['Male', 'Female', 'Other', 'Prefer not to say'].contains(rm.gender)) {
        _selectedGender = rm.gender;
      }
      _ageController.text = rm.age?.toString() ?? '';
      _occupationController.text = rm.occupation;
      _locationController.text = rm.location;
      _bioController.text = rm.bio;
      _aboutController.text = rm.about ?? rm.bio;
      _moveInDateController.text = rm.moveInDate ?? '';
      _budgetController.text = rm.budget != null ? rm.budget!.toStringAsFixed(0) : '';
      _preferredLocationController.text = rm.preferredLocation ?? rm.location;
      _preferencesController.text = rm.preferences ?? '';

      if (rm.interests != null && rm.interests!.isNotEmpty) {
        for (final item in rm.interests!.split(',')) {
          final trimmed = item.trim();
          if (trimmed.isNotEmpty) {
            _selectedInterests.add(trimmed);
          }
        }
      }
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _ageController.dispose();
    _occupationController.dispose();
    _locationController.dispose();
    _bioController.dispose();
    _aboutController.dispose();
    _moveInDateController.dispose();
    _budgetController.dispose();
    _preferredLocationController.dispose();
    _preferencesController.dispose();
    super.dispose();
  }

  void _toggleInterest(String interest) {
    setState(() {
      if (_selectedInterests.contains(interest)) {
        _selectedInterests.remove(interest);
      } else {
        _selectedInterests.add(interest);
      }
    });
  }

  Future<void> _submitForm() async {
    // Auto-populate optional/secondary fields with sensible defaults before validating
    if (_aboutController.text.trim().isEmpty && _bioController.text.trim().isNotEmpty) {
      _aboutController.text = _bioController.text.trim();
    }
    if (_bioController.text.trim().isEmpty && _aboutController.text.trim().isNotEmpty) {
      _bioController.text = _aboutController.text.trim();
    }
    if (_moveInDateController.text.trim().isEmpty) {
      _moveInDateController.text = 'Immediate';
    }
    if (_preferredLocationController.text.trim().isEmpty && _locationController.text.trim().isNotEmpty) {
      _preferredLocationController.text = _locationController.text.trim();
    }
    if (_locationController.text.trim().isEmpty && _preferredLocationController.text.trim().isNotEmpty) {
      _locationController.text = _preferredLocationController.text.trim();
    }

    if (!_formKey.currentState!.validate()) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          0,
          duration: const Duration(milliseconds: 350),
          curve: Curves.easeOutCubic,
        );
      }
      AppNotification.warning(
        context,
        'Please fill in all required fields highlighted at the top.',
        title: 'Incomplete Application',
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final user = context.read<AuthProvider>().user;
    final interestsStr = _selectedInterests.isNotEmpty
        ? _selectedInterests.join(', ')
        : 'General';

    final data = {
      'gender': _selectedGender,
      'age': int.tryParse(_ageController.text.trim()) ?? 22,
      'occupation': _occupationController.text.trim(),
      'location': _locationController.text.trim(),
      'bio': _bioController.text.trim(),
      'about': _aboutController.text.trim().isNotEmpty
          ? _aboutController.text.trim()
          : _bioController.text.trim(),
      'interests': interestsStr,
      'moveInDate': _moveInDateController.text.trim().isNotEmpty
          ? _moveInDateController.text.trim()
          : 'Immediate',
      'budget': double.tryParse(_budgetController.text.trim()) ?? 0.0,
      'preferredLocation': _preferredLocationController.text.trim().isNotEmpty
          ? _preferredLocationController.text.trim()
          : _locationController.text.trim(),
      'preferences': _preferencesController.text.trim(),
      'poster': user != null ? {'id': user.id} : null,
    };

    final roommateProvider = context.read<RoommateProvider>();
    final success = widget.existingRoommate != null && widget.existingRoommate!.id != null
        ? await roommateProvider.updateRoommate(widget.existingRoommate!.id!, data)
        : await roommateProvider.createRoommate(data);

    if (mounted) {
      setState(() => _isSubmitting = false);
      if (success) {
        AppNotification.success(
          context,
          widget.existingRoommate != null
              ? 'Your roommate application has been updated.'
              : 'Your roommate profile is now live on Bodimkarayo.lk!',
          title: widget.existingRoommate != null ? 'Application Updated' : 'Application Submitted',
        );
        Navigator.pop(context, true);
      } else {
        final err = roommateProvider.errorMessage;
        AppNotification.error(
          context,
          err != null
              ? 'Failed to submit application ($err). Please try again.'
              : 'Failed to submit application. Please try again.',
          title: 'Submission Failed',
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.existingRoommate != null;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          isEditing ? 'Edit Roommate Application' : 'Apply as a Roommate',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        flexibleSpace: Container(
          decoration: const BoxDecoration(gradient: AppTheme.primaryGradient),
        ),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        controller: _scrollController,
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Info Banner
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF3488C3).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF3488C3).withValues(alpha: 0.25)),
                ),
                child: const Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.info_outline_rounded, color: Color(0xFF20689B), size: 20),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Your profile details will be listed on Bodimkarayo.lk Roommates so potential flatmates can contact you. Complete all required fields to maximize your AI match rate!',
                        style: TextStyle(color: Color(0xFF1B4B6D), fontSize: 12.5, height: 1.4, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Section 1: Basic Info
              _buildSectionCard(
                icon: '📋',
                title: 'BASIC INFORMATION',
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildLabel('Gender *'),
                              const SizedBox(height: 6),
                              DropdownButtonFormField<String>(
                                initialValue: _selectedGender,
                                decoration: _inputDecoration('Select gender'),
                                items: const [
                                  DropdownMenuItem(value: 'Male', child: Text('Male')),
                                  DropdownMenuItem(value: 'Female', child: Text('Female')),
                                  DropdownMenuItem(value: 'Other', child: Text('Other')),
                                  DropdownMenuItem(value: 'Prefer not to say', child: Text('Prefer not to say')),
                                ],
                                onChanged: (val) {
                                  if (val != null) setState(() => _selectedGender = val);
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildTextField(
                          'Age *',
                          'e.g., 24',
                          controller: _ageController,
                          keyboardType: TextInputType.number,
                        ),
                      ),
                    ],
                  ),
                  _buildTextField(
                    'Occupation *',
                    'e.g., Software Engineer, Student',
                    controller: _occupationController,
                    prefixIcon: Icons.work_outline,
                  ),
                  _buildTextField(
                    'Current Location *',
                    'e.g., Colombo 3, Katubedda',
                    controller: _locationController,
                    prefixIcon: Icons.location_on_outlined,
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Section 2: About You
              _buildSectionCard(
                icon: '✍️',
                title: 'ABOUT YOU',
                children: [
                  _buildTextField(
                    'Short Bio / Headline *',
                    'A catchy tagline about your lifestyle (e.g. Quiet engineering student looking for a clean place)',
                    controller: _bioController,
                    maxLines: 2,
                  ),
                  _buildTextField(
                    'Detailed Description *',
                    'Share about your personality, daily routine, study/work hours, and what you expect from a flatmate...',
                    controller: _aboutController,
                    maxLines: 4,
                    maxLength: 500,
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Section 3: Your Interests
              _buildSectionCard(
                icon: '🎯',
                title: 'YOUR INTERESTS *',
                subtitle: 'Select all that apply',
                children: [
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _allInterests.map((interest) {
                      final isSelected = _selectedInterests.contains(interest);
                      return GestureDetector(
                        onTap: () => _toggleInterest(interest),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF3488C3) : const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? const Color(0xFF3488C3) : Colors.transparent,
                            ),
                            boxShadow: isSelected
                                ? [
                                    BoxShadow(
                                      color: const Color(0xFF3488C3).withValues(alpha: 0.25),
                                      blurRadius: 8,
                                      offset: const Offset(0, 3),
                                    ),
                                  ]
                                : [],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (isSelected) ...[
                                const Icon(Icons.check, size: 14, color: Colors.white),
                                const SizedBox(width: 4),
                              ],
                              Text(
                                interest,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white : const Color(0xFF334155),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Section 4: Move-In & Budget
              _buildSectionCard(
                icon: '💰',
                title: 'MOVE-IN & BUDGET',
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: _buildTextField(
                          'Move-In Date *',
                          'e.g., 2026-12 or Immediate',
                          controller: _moveInDateController,
                          prefixIcon: Icons.calendar_today_outlined,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildTextField(
                          'Monthly Budget (LKR) *',
                          'e.g., 25000',
                          controller: _budgetController,
                          keyboardType: TextInputType.number,
                          prefixIcon: Icons.payments_outlined,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Section 5: Roommate Preferences
              _buildSectionCard(
                icon: '🔍',
                title: 'ROOMMATE PREFERENCES',
                children: [
                  _buildTextField(
                    'Preferred Location / Area *',
                    'e.g., Colombo 4-7, Moratuwa, Malabe',
                    controller: _preferredLocationController,
                    prefixIcon: Icons.place_outlined,
                  ),
                  _buildTextField(
                    'Specific Roommate Preferences (Optional)',
                    'e.g., Prefer quiet non-smoker, early riser, pet-friendly, vegetarian, etc.',
                    controller: _preferencesController,
                    maxLines: 3,
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Submit Button
              ElevatedButton.icon(
                onPressed: _isSubmitting ? null : _submitForm,
                icon: _isSubmitting
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Icon(Icons.check_circle_outline, color: Colors.white),
                label: Text(
                  isEditing ? 'Save Changes' : 'Submit Application',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF3488C3),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionCard({
    required String icon,
    required String title,
    String? subtitle,
    required List<Widget> children,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(icon, style: const TextStyle(fontSize: 16)),
                  const SizedBox(width: 8),
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF64748B),
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
              if (subtitle != null)
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF3488C3),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildLabel(String label) {
    return Text(
      label.toUpperCase(),
      style: const TextStyle(
        color: Color(0xFF334155),
        fontSize: 11,
        fontWeight: FontWeight.w800,
        letterSpacing: 0.5,
      ),
    );
  }

  InputDecoration _inputDecoration(String hint, {IconData? prefixIcon}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: Colors.grey[400], fontSize: 13),
      prefixIcon: prefixIcon != null ? Icon(prefixIcon, size: 18, color: const Color(0xFF94A3B8)) : null,
      filled: true,
      fillColor: const Color(0xFFF8FAFC),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: Color(0xFF3488C3), width: 1.5),
      ),
    );
  }

  Widget _buildTextField(
    String label,
    String hint, {
    TextEditingController? controller,
    int maxLines = 1,
    int? maxLength,
    TextInputType? keyboardType,
    IconData? prefixIcon,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildLabel(label),
          const SizedBox(height: 6),
          TextFormField(
            controller: controller,
            maxLines: maxLines,
            maxLength: maxLength,
            keyboardType: keyboardType,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF0F172A)),
            decoration: _inputDecoration(hint, prefixIcon: prefixIcon),
            validator: (value) {
              if (label.contains('*') && (value == null || value.trim().isEmpty)) {
                return 'Required';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }
}
