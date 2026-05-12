import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../providers/roommate_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/roommate_model.dart';

class ApplyRoommateScreen extends StatefulWidget {
  final RoommateModel? existingRoommate;
  const ApplyRoommateScreen({super.key, this.existingRoommate});

  @override
  State<ApplyRoommateScreen> createState() => _ApplyRoommateScreenState();
}

class _ApplyRoommateScreenState extends State<ApplyRoommateScreen> {
  final _formKey = GlobalKey<FormState>();
  final _ageController = TextEditingController();
  final _occupationController = TextEditingController();
  final _locationController = TextEditingController();
  final _budgetController = TextEditingController();
  final _bioController = TextEditingController();
  final _interestsController = TextEditingController();
  final _preferencesController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    if (widget.existingRoommate != null) {
      final rm = widget.existingRoommate!;
      _ageController.text = rm.age?.toString() ?? '';
      _occupationController.text = rm.occupation;
      _locationController.text = rm.location;
      _budgetController.text = rm.budget?.toString() ?? '';
      _bioController.text = rm.bio;
      _interestsController.text = rm.interests ?? '';
      _preferencesController.text = rm.preferences ?? '';
    }
  }

  @override
  void dispose() {
    _ageController.dispose();
    _occupationController.dispose();
    _locationController.dispose();
    _budgetController.dispose();
    _bioController.dispose();
    _interestsController.dispose();
    _preferencesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.existingRoommate != null;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text(isEditing ? 'Edit Roommate Post' : 'Apply as Roommate'),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: AppTheme.primaryGradient,
          ),
        ),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // User Info Info Box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue[100]!),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.blue),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Your name, email, and profile picture will be taken from your account. Fill in the additional details below to be listed.',
                      style: TextStyle(color: Colors.blueGrey, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Form
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Expanded(child: _buildTextField('Age *', 'e.g., 25', controller: _ageController, keyboardType: TextInputType.number)),
                        const SizedBox(width: 16),
                        Expanded(child: _buildTextField('Occupation *', 'e.g., Student', controller: _occupationController)),
                      ],
                    ),
                    Row(
                      children: [
                        Expanded(child: _buildTextField('Location *', 'e.g., Colombo 3', controller: _locationController)),
                        const SizedBox(width: 16),
                        Expanded(child: _buildTextField('Budget (Optional)', 'Monthly budget', controller: _budgetController, keyboardType: TextInputType.number)),
                      ],
                    ),
                    _buildTextField('Bio *', 'Tell us about yourself...', controller: _bioController, maxLines: 3),
                    _buildTextField('Interests', 'e.g., Reading, Cooking, Sports (comma separated)', controller: _interestsController),
                    _buildTextField('Preferences (Optional)', 'Any specific preferences for a roommate?', controller: _preferencesController, maxLines: 2),

                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitForm,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: _isSubmitting 
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : Text(isEditing ? 'Update Application' : 'Submit Application', style: const TextStyle(fontSize: 16)),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submitForm() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isSubmitting = true);
      
      final user = context.read<AuthProvider>().user;
      
      final data = {
        'age': int.tryParse(_ageController.text),
        'occupation': _occupationController.text,
        'location': _locationController.text,
        'budget': double.tryParse(_budgetController.text),
        'bio': _bioController.text,
        'interests': _interestsController.text,
        'preferences': _preferencesController.text,
        'gender': 'Unknown', 
        'poster': user != null ? {'id': user.id} : null,
      };

      final success = widget.existingRoommate != null
          ? await context.read<RoommateProvider>().updateRoommate(widget.existingRoommate!.id!, data)
          : await context.read<RoommateProvider>().createRoommate(data);
      
      if (mounted) {
        setState(() => _isSubmitting = false);
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(widget.existingRoommate != null ? 'Application updated successfully!' : 'Application submitted successfully!')),
          );
          Navigator.pop(context);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to submit application. Please try again.')),
          );
        }
      }
    }
  }

  Widget _buildTextField(String label, String hint, {TextEditingController? controller, int maxLines = 1, TextInputType? keyboardType}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[700], fontSize: 13, fontWeight: FontWeight.w500)),
          const SizedBox(height: 6),
          TextFormField(
            controller: controller,
            maxLines: maxLines,
            keyboardType: keyboardType,
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
              filled: true,
              fillColor: Colors.white,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Theme.of(context).colorScheme.primary),
              ),
            ),
            validator: (value) {
              if (label.contains('*') && (value == null || value.isEmpty)) {
                return 'This field is required';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }
}
