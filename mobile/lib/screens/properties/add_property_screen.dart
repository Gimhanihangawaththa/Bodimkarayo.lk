import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../models/property_model.dart';
import '../../providers/property_provider.dart';
import '../../providers/auth_provider.dart';
import '../../utils/app_notification.dart';
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
  late TextEditingController _availableFromController;
  late TextEditingController _locationController;
  late TextEditingController _addressController;
  late TextEditingController _numberOfPeopleController;
  late TextEditingController _descriptionController;
  late TextEditingController _bedroomsController;
  late TextEditingController _bathroomsController;
  late TextEditingController _kitchensController;
  late TextEditingController _floorController;
  late TextEditingController _furnishedController;
  late TextEditingController _parkingController;
  late TextEditingController _petsAllowedController;
  late TextEditingController _offersController;
  late TextEditingController _highlightsController;
  late TextEditingController _rulesController;
  late TextEditingController _nearbyController;

  String _genderPreference = 'Both';
  final Set<String> _suitableForSet = {'Any'};

  @override
  void initState() {
    super.initState();
    final p = widget.property;
    _titleController = TextEditingController(text: p?.title ?? '');
    _typeController = TextEditingController(text: p?.propertyType ?? 'Room');
    _priceController = TextEditingController(text: p != null ? p.rent.toStringAsFixed(0) : '');
    _availableFromController = TextEditingController(text: p?.availableFrom ?? 'Immediate');
    _locationController = TextEditingController(text: p?.location ?? '');
    _addressController = TextEditingController(text: p?.address ?? '');
    _numberOfPeopleController = TextEditingController(text: p?.numberOfPeople ?? '1 Person');
    _descriptionController = TextEditingController(text: p?.description ?? '');
    _bedroomsController = TextEditingController(text: p?.bedrooms?.toString() ?? '1');
    _bathroomsController = TextEditingController(text: p?.bathrooms?.toString() ?? '1');
    _kitchensController = TextEditingController(text: p?.kitchens?.toString() ?? '1');
    _floorController = TextEditingController(text: p?.floor ?? 'Ground Floor');
    _furnishedController = TextEditingController(text: p?.furnished ?? 'Fully Furnished');
    _parkingController = TextEditingController(text: p?.parking ?? 'Available');
    _petsAllowedController = TextEditingController(text: p?.petsAllowed ?? 'No');
    _offersController = TextEditingController(text: p?.offers?.join(', ') ?? 'High-Speed Wi-Fi, Attached Bathroom, 24/7 Security');
    _highlightsController = TextEditingController(text: p?.highlights?.join(', ') ?? '5 mins to Bus Stand, Quiet Study Environment');
    _rulesController = TextEditingController(text: p?.rules?.join(', ') ?? 'No smoking inside rooms, Keep common areas clean');
    _nearbyController = TextEditingController(text: p?.nearby?.join(', ') ?? 'Supermarket, Pharmacy, University');

    if (p?.genderPreference != null && p!.genderPreference!.isNotEmpty) {
      _genderPreference = p.genderPreference!;
    }
    if (p?.suitableFor != null && p!.suitableFor!.isNotEmpty) {
      _suitableForSet.clear();
      for (final part in p.suitableFor!.split(',')) {
        final trimmed = part.trim();
        if (trimmed.isNotEmpty) _suitableForSet.add(trimmed);
      }
      if (_suitableForSet.isEmpty) _suitableForSet.add('Any');
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _typeController.dispose();
    _priceController.dispose();
    _availableFromController.dispose();
    _locationController.dispose();
    _addressController.dispose();
    _numberOfPeopleController.dispose();
    _descriptionController.dispose();
    _bedroomsController.dispose();
    _bathroomsController.dispose();
    _kitchensController.dispose();
    _floorController.dispose();
    _furnishedController.dispose();
    _parkingController.dispose();
    _petsAllowedController.dispose();
    _offersController.dispose();
    _highlightsController.dispose();
    _rulesController.dispose();
    _nearbyController.dispose();
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

  void _toggleSuitableFor(String val) {
    setState(() {
      if (val == 'Any') {
        _suitableForSet
          ..clear()
          ..add('Any');
        return;
      }
      _suitableForSet.remove('Any');
      if (_suitableForSet.contains(val)) {
        _suitableForSet.remove(val);
      } else {
        _suitableForSet.add(val);
      }
      if (_suitableForSet.isEmpty) {
        _suitableForSet.add('Any');
      }
    });
  }

  List<String> _splitList(String text) {
    return text
        .split(',')
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty)
        .toList();
  }

  Future<void> _submitForm() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (!authProvider.isAuthenticated) {
      AppNotification.warning(
        context,
        'Please sign in first to publish a property.',
        title: 'Sign-In Required',
        actionLabel: 'Sign In',
        onAction: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const SignInScreen()),
        ),
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
      availableFrom: _availableFromController.text.trim(),
      address: _addressController.text.trim(),
      numberOfPeople: _numberOfPeopleController.text.trim(),
      genderPreference: _genderPreference,
      suitableFor: _suitableForSet.join(', '),
      bedrooms: int.tryParse(_bedroomsController.text.trim()) ?? 1,
      bathrooms: int.tryParse(_bathroomsController.text.trim()) ?? 1,
      kitchens: int.tryParse(_kitchensController.text.trim()) ?? 1,
      floor: _floorController.text.trim(),
      furnished: _furnishedController.text.trim(),
      parking: _parkingController.text.trim(),
      petsAllowed: _petsAllowedController.text.trim(),
      offers: _splitList(_offersController.text),
      highlights: _splitList(_highlightsController.text),
      rules: _splitList(_rulesController.text),
      nearby: _splitList(_nearbyController.text),
      images: widget.property?.images ?? [],
      ownerId: authProvider.user?.id,
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
        AppNotification.success(
          context,
          widget.property == null
              ? 'Your property listing is now live!'
              : 'Your property listing has been updated.',
          title: widget.property == null ? 'Property Published' : 'Property Updated',
        );
        Navigator.pop(context, true);
      } else {
        final errorMsg = provider.errorMessage ?? 'Operation failed. Please try again.';
        AppNotification.error(
          context,
          errorMsg,
          title: 'Could Not Save Property',
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.property != null;
    final isAuthenticated = context.watch<AuthProvider>().isAuthenticated;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          isEdit ? 'Edit Property Listing' : 'Publish New Property',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        flexibleSpace: Container(
          decoration: const BoxDecoration(gradient: AppTheme.primaryGradient),
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
                    _buildSectionTitle('Property Photos (Up to 5 Photos)'),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.shade200),
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

                    // Basic Information
                    _buildSectionTitle('Basic Information'),
                    _buildTextField(_titleController, 'Property Title *', 'e.g., Luxury Annex Studio near UOC'),
                    _buildTextField(_typeController, 'Property Type *', 'Room, Annex, Apartment, House, Hostel'),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: ['Room', 'Annex', 'Apartment', 'House', 'Hostel'].map((type) {
                        final isSelected = _typeController.text.toLowerCase() == type.toLowerCase();
                        return ChoiceChip(
                          label: Text(type),
                          selected: isSelected,
                          selectedColor: const Color(0xFF3488C3),
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.white : const Color(0xFF334155),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                          onSelected: (_) => setState(() => _typeController.text = type),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: _buildTextField(
                            _priceController,
                            'Monthly Rent (LKR) *',
                            'e.g., 25000',
                            keyboardType: TextInputType.number,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildTextField(
                            _availableFromController,
                            'Available From *',
                            'e.g., Immediate',
                          ),
                        ),
                      ],
                    ),
                    _buildTextField(_locationController, 'Location / Area *', 'e.g., Colombo 07, Katubedda'),
                    _buildTextField(_addressController, 'Full Address *', 'e.g., No. 45/2, Reid Avenue, Colombo 07', maxLines: 2),

                    const SizedBox(height: 20),

                    // Tenant Eligibility & Capacity Guidelines
                    _buildSectionTitle('Tenant Eligibility & Capacity Guidelines'),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'GENDER REQUIREMENT / PREFERENCE *',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              {'value': 'Both', 'label': 'Open to All', 'icon': '🚻'},
                              {'value': 'Male', 'label': 'Male Only', 'icon': '👨'},
                              {'value': 'Female', 'label': 'Female Only', 'icon': '👩'},
                            ].map((item) {
                              final isSelected = _genderPreference.toLowerCase() == item['value']!.toLowerCase();
                              return Expanded(
                                child: GestureDetector(
                                  onTap: () => setState(() => _genderPreference = item['value']!),
                                  child: Container(
                                    margin: const EdgeInsets.symmetric(horizontal: 4),
                                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
                                    decoration: BoxDecoration(
                                      color: isSelected ? const Color(0xFFEAF4FB) : const Color(0xFFF8FAFC),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: isSelected ? const Color(0xFF3488C3) : const Color(0xFFE2E8F0),
                                        width: isSelected ? 1.5 : 1,
                                      ),
                                    ),
                                    child: Column(
                                      children: [
                                        Text(item['icon']!, style: const TextStyle(fontSize: 20)),
                                        const SizedBox(height: 4),
                                        Text(
                                          item['label']!,
                                          textAlign: TextAlign.center,
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: isSelected ? const Color(0xFF1B4B6D) : const Color(0xFF475569),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 18),
                          const Text(
                            'SUITABLE FOR / TARGET TENANTS *',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                          ),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              {'value': 'University Students', 'label': '🎓 Students'},
                              {'value': 'Working Professionals', 'label': '💼 Professionals'},
                              {'value': 'Couples', 'label': '💑 Couples'},
                              {'value': 'Family', 'label': '👨‍👩‍👧‍👦 Families'},
                              {'value': 'Any', 'label': '🌐 Any / Anyone'},
                            ].map((item) {
                              final isSelected = _suitableForSet.contains(item['value']);
                              return FilterChip(
                                label: Text(item['label']!),
                                selected: isSelected,
                                selectedColor: const Color(0xFF3488C3),
                                checkmarkColor: Colors.white,
                                labelStyle: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white : const Color(0xFF334155),
                                ),
                                onSelected: (_) => _toggleSuitableFor(item['value']!),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 18),
                          const Text(
                            'CAPACITY / NUMBER OF PERSONS *',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                          ),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: ['1 Person', '2 Persons', '3 Persons', '4 Persons', '5+ Persons'].map((cap) {
                              final isSelected = _numberOfPeopleController.text == cap;
                              return ChoiceChip(
                                label: Text('👥 $cap'),
                                selected: isSelected,
                                selectedColor: const Color(0xFF3488C3),
                                labelStyle: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white : const Color(0xFF334155),
                                ),
                                onSelected: (_) => setState(() => _numberOfPeopleController.text = cap),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 12),
                          _buildTextField(_numberOfPeopleController, 'Custom Occupant Capacity', 'e.g., 2 Persons'),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),
                    _buildSectionTitle('Rooms & Layout Specifications'),
                    Row(
                      children: [
                        Expanded(child: _buildTextField(_bedroomsController, 'Bedrooms', '1', keyboardType: TextInputType.number)),
                        const SizedBox(width: 12),
                        Expanded(child: _buildTextField(_bathroomsController, 'Bathrooms', '1', keyboardType: TextInputType.number)),
                        const SizedBox(width: 12),
                        Expanded(child: _buildTextField(_kitchensController, 'Kitchens', '1', keyboardType: TextInputType.number)),
                      ],
                    ),
                    Row(
                      children: [
                        Expanded(child: _buildTextField(_floorController, 'Floor Level', 'Ground Floor')),
                        const SizedBox(width: 12),
                        Expanded(child: _buildTextField(_furnishedController, 'Furnishing', 'Fully Furnished')),
                      ],
                    ),
                    Row(
                      children: [
                        Expanded(child: _buildTextField(_parkingController, 'Parking', 'Bike / Car Parking')),
                        const SizedBox(width: 12),
                        Expanded(child: _buildTextField(_petsAllowedController, 'Pets Allowed', 'Yes / No')),
                      ],
                    ),

                    const SizedBox(height: 24),
                    _buildSectionTitle('Description, Facilities & Rules'),
                    _buildTextField(_descriptionController, 'Detailed Description *', 'Describe amenities, electricity/water bills, quiet hours...', maxLines: 4),
                    _buildTextField(_offersController, 'Key Offerings (comma separated)', 'Wi-Fi, AC, Attached Bath', isRequired: false),
                    _buildTextField(_highlightsController, 'Key Highlights (comma separated)', '5 mins to bus stop, Quiet area', isRequired: false),
                    _buildTextField(_rulesController, 'House Rules (comma separated)', 'No smoking, Visitors until 8 PM', isRequired: false),
                    _buildTextField(_nearbyController, 'Nearby Landmarks (comma separated)', 'University, Supermarket', isRequired: false),

                    const SizedBox(height: 28),
                    ElevatedButton(
                      onPressed: _submitForm,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0A2463),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: Text(
                        isEdit ? 'Save Property Changes' : 'Publish Property Listing',
                        style: const TextStyle(fontSize: 16, color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 15),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
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
      child: Text(
        title,
        style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: Color(0xFF0A2463)),
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    String hint, {
    int maxLines = 1,
    TextInputType? keyboardType,
    bool isRequired = true,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14.0),
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
          if (isRequired && (value == null || value.trim().isEmpty)) {
            return 'Please enter $label';
          }
          return null;
        },
      ),
    );
  }
}
