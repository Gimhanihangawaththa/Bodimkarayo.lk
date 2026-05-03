import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/property_model.dart';
import '../../providers/property_provider.dart';
import '../../theme/app_theme.dart';

class AddPropertyScreen extends StatefulWidget {
  final PropertyModel? property;
  const AddPropertyScreen({super.key, this.property});

  @override
  State<AddPropertyScreen> createState() => _AddPropertyScreenState();
}

class _AddPropertyScreenState extends State<AddPropertyScreen> {
  final _formKey = GlobalKey<FormState>();
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
    _typeController = TextEditingController(text: widget.property?.propertyType ?? '');
    _priceController = TextEditingController(text: widget.property?.rent.toString() ?? '');
    _locationController = TextEditingController(text: widget.property?.location ?? '');
    _addressController = TextEditingController(text: widget.property?.address ?? '');
    _descriptionController = TextEditingController(text: widget.property?.description ?? '');
    _bedroomsController = TextEditingController(text: widget.property?.bedrooms?.toString() ?? '0');
    _bathroomsController = TextEditingController(text: widget.property?.bathrooms?.toString() ?? '0');
    _kitchensController = TextEditingController(text: widget.property?.kitchens?.toString() ?? '0');
    _sizeController = TextEditingController(text: widget.property?.floor ?? ''); // Using floor as size/floor info
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

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final property = PropertyModel(
      id: widget.property?.id,
      title: _titleController.text,
      description: _descriptionController.text,
      location: _locationController.text,
      rent: double.tryParse(_priceController.text) ?? 0.0,
      propertyType: _typeController.text,
      address: _addressController.text,
      bedrooms: int.tryParse(_bedroomsController.text) ?? 0,
      bathrooms: int.tryParse(_bathroomsController.text) ?? 0,
      kitchens: int.tryParse(_kitchensController.text) ?? 0,
      floor: _sizeController.text,
      images: widget.property?.images ?? [], // Keep existing images for now
    );

    final provider = Provider.of<PropertyProvider>(context, listen: false);
    bool success;
    if (widget.property == null) {
      success = await provider.addProperty(property);
    } else {
      success = await provider.updateProperty(property);
    }

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(widget.property == null ? 'Property added successfully' : 'Property updated successfully')),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Operation failed. Please try again.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.property != null;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text(isEdit ? 'Edit Property' : 'Add Property'),
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
                  _buildSectionTitle('Basic Information'),
                  _buildTextField(_titleController, 'Title', 'Property title'),
                  _buildTextField(_typeController, 'Type', 'Property type (e.g., Apartment)'),
                  _buildTextField(_priceController, 'Price', 'Monthly Price', keyboardType: TextInputType.number),
                  _buildTextField(_locationController, 'Location', 'City/Area'),
                  _buildTextField(_addressController, 'Full Address', 'Detailed address', maxLines: 2),

                  const SizedBox(height: 24),
                  _buildSectionTitle('Specifications'),
                  Row(
                    children: [
                      Expanded(child: _buildTextField(_bedroomsController, 'Bedrooms', '0', keyboardType: TextInputType.number)),
                      const SizedBox(width: 16),
                      Expanded(child: _buildTextField(_bathroomsController, 'Bathrooms', '0', keyboardType: TextInputType.number)),
                      const SizedBox(width: 16),
                      Expanded(child: _buildTextField(_kitchensController, 'Kitchens', '0', keyboardType: TextInputType.number)),
                    ],
                  ),
                  _buildTextField(_sizeController, 'Floor/Size', 'e.g., 6th floor or 1150 sqft'),

                  const SizedBox(height: 24),
                  _buildSectionTitle('Description'),
                  _buildTextField(_descriptionController, 'Details', 'Write a detailed description', maxLines: 4),

                  const SizedBox(height: 32),
                  ElevatedButton(
                    onPressed: _submitForm,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: Text(isEdit ? 'Update Property' : 'Publish Property', style: const TextStyle(fontSize: 16, color: Colors.white)),
                  ),
                  const SizedBox(height: 16),
                  OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
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
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
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
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Theme.of(context).colorScheme.primary),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
        ),
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Please enter $label';
          }
          return null;
        },
      ),
    );
  }
}
