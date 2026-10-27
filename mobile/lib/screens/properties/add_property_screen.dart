import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../models/property_model.dart';
import '../../providers/property_provider.dart';
import '../../providers/auth_provider.dart';
import '../auth/sign_in_screen.dart';
import '../../theme/app_theme.dart';

class AddPropertyScreen extends StatefulWidget {
  final PropertyModel? property;
  const AddPropertyScreen({super.key, this.property});

  @override
  State<AddPropertyScreen> createState() => _AddPropertyScreenState();
}

class _AddPropertyScreenState extends State<AddPropertyScreen> {
  final _formKey = GlobalKey<FormState>();
  final ImagePicker _picker = ImagePicker();
  final List<XFile> _selectedImages = [];
  bool _isLoading = false;

  late TextEditingController _titleController;
  late TextEditingController _typeController;
  late TextEditingController _priceController;
  late TextEditingController _locationController;
  late TextEditingController _addressController;
  late TextEditingController _descriptionController;
  late TextEditingController _bedroomsController;
  late TextEditingController _bathroomsController;
  late TextEditingController _kitchensController;
  late TextEditingController _sizeController;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.property?.title ?? '');
    _typeController = TextEditingController(text: widget.property?.propertyType ?? 'Single Room');
    _priceController = TextEditingController(text: widget.property != null ? widget.property!.rent.toString() : '');
    _locationController = TextEditingController(text: widget.property?.location ?? '');
    _addressController = TextEditingController(text: widget.property?.address ?? '');
    _descriptionController = TextEditingController(text: widget.property?.description ?? '');
    _bedroomsController = TextEditingController(text: widget.property?.bedrooms?.toString() ?? '1');
    _bathroomsController = TextEditingController(text: widget.property?.bathrooms?.toString() ?? '1');
    _kitchensController = TextEditingController(text: widget.property?.kitchens?.toString() ?? '1');
    _sizeController = TextEditingController(text: widget.property?.floor ?? 'Ground Floor');
  }

  @override
  void dispose() {
    _titleController.dispose();
    _typeController.dispose();
    _priceController.dispose();
    _locationController.dispose();
    _addressController.dispose();
    _descriptionController.dispose();
    _bedroomsController.dispose();
    _bathroomsController.dispose();
    _kitchensController.dispose();
    _sizeController.dispose();
    super.dispose();
  }

  void _pickImages() async {
    try {
      final List<XFile> images = await _picker.pickMultiImage();
      if (images.isNotEmpty) {
        setState(() {
          _selectedImages.addAll(images);
        });
      }
    } catch (e) {
      debugPrint('Error picking images: $e');
    }
  }

  Future<void> _submitForm() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (!authProvider.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please sign in first to publish a property.'),
          backgroundColor: Colors.orange.shade800,
          action: SnackBarAction(
            label: 'Sign In',
            textColor: Colors.white,
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const SignInScreen()),
            ),
          ),
        ),
      );
      Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => const SignInScreen()),
      );
      return;
    }

    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final property = PropertyModel(
      id: widget.property?.id,
      title: _titleController.text.trim(),
      description: _descriptionController.text.trim(),
      location: _locationController.text.trim(),
      rent: double.tryParse(_priceController.text.trim()) ?? 0.0,
      propertyType: _typeController.text.trim(),
      address: _addressController.text.trim(),
      bedrooms: int.tryParse(_bedroomsController.text.trim()) ?? 1,
      bathrooms: int.tryParse(_bathroomsController.text.trim()) ?? 1,
      kitchens: int.tryParse(_kitchensController.text.trim()) ?? 1,
      floor: _sizeController.text.trim(),
      images: widget.property?.images ?? [],
    );

    final provider = Provider.of<PropertyProvider>(context, listen: false);
    bool success;

    if (_selectedImages.isNotEmpty && widget.property == null) {
      success = await provider.addPropertyMultipart(property, _selectedImages);
    } else if (widget.property == null) {
      success = await provider.addProperty(property);
    } else {
      success = await provider.updateProperty(property);
    }

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(widget.property == null ? 'Property published successfully!' : 'Property updated successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context);
      } else {
        final errorMsg = provider.errorMessage ?? 'Operation failed. Please try again.';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMsg),
            backgroundColor: Colors.red,
            action: errorMsg.contains('sign in') || errorMsg.contains('unauthenticated')
                ? SnackBarAction(
                    label: 'Sign In',
                    textColor: Colors.white,
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const SignInScreen()),
                    ),
                  )
                : null,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.property != null;
    final isAuthenticated = context.watch<AuthProvider>().isAuthenticated;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text(isEdit ? 'Edit Property' : 'Add Property', style: const TextStyle(fontWeight: FontWeight.bold)),
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: AppTheme.primaryGradient,
          ),
        ),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (!isAuthenticated)
                      Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF7ED),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFFDBA74)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.info_outline, color: Color(0xFFEA580C), size: 20),
                            const SizedBox(width: 10),
                            const Expanded(
                              child: Text(
                                'Please sign in to publish your property listing.',
                                style: TextStyle(color: Color(0xFF9A3412), fontSize: 13, fontWeight: FontWeight.w500),
                              ),
                            ),
                            TextButton(
                              onPressed: () => Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const SignInScreen()),
                              ),
                              child: const Text('Sign In', style: TextStyle(color: Color(0xFFEA580C), fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                      ),

                    // Photos Section
                    _buildSectionTitle('Property Photos'),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (_selectedImages.isNotEmpty)
                            SizedBox(
                              height: 90,
                              child: ListView.builder(
                                scrollDirection: Axis.horizontal,
                                itemCount: _selectedImages.length,
                                itemBuilder: (context, index) {
                                  final img = _selectedImages[index];
                                  return Stack(
                                    children: [
                                      Container(
                                        width: 90,
                                        height: 90,
                                        margin: const EdgeInsets.only(right: 10),
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(10),
                                          color: Colors.grey.shade200,
                                        ),
                                        child: ClipRRect(
                                          borderRadius: BorderRadius.circular(10),
                                          child: kIsWeb
                                              ? const Icon(Icons.image, size: 40)
                                              : Image.file(File(img.path), fit: BoxFit.cover),
                                        ),
                                      ),
                                      Positioned(
                                        top: 2,
                                        right: 12,
                                        child: GestureDetector(
                                          onTap: () {
                                            setState(() {
                                              _selectedImages.removeAt(index);
                                            });
                                          },
                                          child: Container(
                                            padding: const EdgeInsets.all(2),
                                            decoration: const BoxDecoration(
                                              color: Colors.red,
                                              shape: BoxShape.circle,
                                            ),
                                            child: const Icon(Icons.close, size: 14, color: Colors.white),
                                          ),
                                        ),
                                      ),
                                    ],
                                  );
                                },
                              ),
                            ),
                          const SizedBox(height: 10),
                          OutlinedButton.icon(
                            onPressed: _pickImages,
                            icon: const Icon(Icons.add_photo_alternate_outlined),
                            label: Text(_selectedImages.isEmpty ? 'Select Photos from Gallery' : 'Add More Photos'),
                            style: OutlinedButton.styleFrom(
                              minimumSize: const Size(double.infinity, 44),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),

                    _buildSectionTitle('Basic Information'),
                    _buildTextField(_titleController, 'Title', 'e.g., Spacious Annex near University'),
                    _buildTextField(_typeController, 'Type', 'e.g., Single Room, Annex, Apartment'),
                    _buildTextField(_priceController, 'Monthly Rent (LKR)', 'e.g., 25000', keyboardType: TextInputType.number),
                    _buildTextField(_locationController, 'City / Area', 'e.g., Moratuwa, Colombo 03'),
                    _buildTextField(_addressController, 'Full Address', 'e.g., No. 12, Temple Road', maxLines: 2),

                    const SizedBox(height: 24),
                    _buildSectionTitle('Specifications'),
                    Row(
                      children: [
                        Expanded(child: _buildTextField(_bedroomsController, 'Bedrooms', '1', keyboardType: TextInputType.number)),
                        const SizedBox(width: 12),
                        Expanded(child: _buildTextField(_bathroomsController, 'Bathrooms', '1', keyboardType: TextInputType.number)),
                        const SizedBox(width: 12),
                        Expanded(child: _buildTextField(_kitchensController, 'Kitchens', '1', keyboardType: TextInputType.number)),
                      ],
                    ),
                    _buildTextField(_sizeController, 'Floor / Unit', 'e.g., 2nd Floor, Ground Floor'),

                    const SizedBox(height: 24),
                    _buildSectionTitle('Description & Rules'),
                    _buildTextField(_descriptionController, 'Description', 'Describe amenities, electricity/water bills, quiet hours...', maxLines: 4),

                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: _submitForm,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0A2463),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(
                        isEdit ? 'Update Property' : 'Publish Property',
                        style: const TextStyle(fontSize: 16, color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 16),
                    OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Cancel'),
                    ),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0A2463))),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, String hint, {int maxLines = 1, TextInputType? keyboardType}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFF0A2463), width: 1.5),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
        ),
        validator: (value) {
          if (value == null || value.trim().isEmpty) {
            return 'Please enter $label';
          }
          return null;
        },
      ),
    );
  }
}
