class PropertyModel {
  final int? id;
  final String title;
  final String description;
  final String location;
  final double rent;
  final String? propertyType;
  final String? availableFrom;
  final String? address;
  final String? numberOfPeople;
  final String? genderPreference;
  final String? suitableFor;
  final int? bedrooms;
  final int? kitchens;
  final int? bathrooms;
  final String? floor;
  final String? furnished;
  final String? parking;
  final String? petsAllowed;
  final String? mapEmbedUrl;
  final List<String>? offers;
  final List<String>? highlights;
  final List<String>? rules;
  final List<String>? nearby;
  final List<String>? images;
  final String? badge;
  final double? rating;
  final int? ownerId;
  final String? ownerName;
  final String? ownerEmail;
  final String? ownerAvatar;

  PropertyModel({
    this.id,
    required this.title,
    required this.description,
    required this.location,
    required this.rent,
    this.propertyType,
    this.availableFrom,
    this.address,
    this.numberOfPeople,
    this.genderPreference,
    this.suitableFor,
    this.bedrooms,
    this.kitchens,
    this.bathrooms,
    this.floor,
    this.furnished,
    this.parking,
    this.petsAllowed,
    this.mapEmbedUrl,
    this.offers,
    this.highlights,
    this.rules,
    this.nearby,
    this.images,
    this.badge,
    this.rating,
    this.ownerId,
    this.ownerName,
    this.ownerEmail,
    this.ownerAvatar,
  });

  factory PropertyModel.fromJson(Map<String, dynamic> json) {
    final ownerObj = json['owner'] as Map<String, dynamic>?;
    return PropertyModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? ''),
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      location: json['location'] ?? '',
      rent: (json['rent'] as num?)?.toDouble() ?? 0.0,
      propertyType: json['propertyType'],
      availableFrom: json['availableFrom'],
      address: json['address'],
      numberOfPeople: json['numberOfPeople'],
      genderPreference: json['genderPreference'] ?? 'Both',
      suitableFor: json['suitableFor'] ?? 'Any',
      bedrooms: json['bedrooms'] is int ? json['bedrooms'] : int.tryParse(json['bedrooms']?.toString() ?? ''),
      kitchens: json['kitchens'] is int ? json['kitchens'] : int.tryParse(json['kitchens']?.toString() ?? ''),
      bathrooms: json['bathrooms'] is int ? json['bathrooms'] : int.tryParse(json['bathrooms']?.toString() ?? ''),
      floor: json['floor'],
      furnished: json['furnished'],
      parking: json['parking'],
      petsAllowed: json['petsAllowed'],
      mapEmbedUrl: json['mapEmbedUrl'],
      offers: json['offers'] != null ? List<String>.from(json['offers']) : [],
      highlights: json['highlights'] != null ? List<String>.from(json['highlights']) : [],
      rules: json['rules'] != null ? List<String>.from(json['rules']) : [],
      nearby: json['nearby'] != null ? List<String>.from(json['nearby']) : [],
      images: json['images'] != null ? List<String>.from(json['images']) : [],
      badge: json['badge'] ?? json['propertyType'],
      rating: (json['rating'] as num?)?.toDouble() ?? 4.8,
      ownerId: ownerObj != null
          ? (ownerObj['id'] is int ? ownerObj['id'] : int.tryParse(ownerObj['id']?.toString() ?? ''))
          : (json['ownerId'] is int ? json['ownerId'] : int.tryParse(json['ownerId']?.toString() ?? '')),
      ownerName: ownerObj?['fullName'] ?? ownerObj?['name'] ?? json['ownerName'],
      ownerEmail: ownerObj?['email'] ?? json['ownerEmail'],
      ownerAvatar: ownerObj?['profilePictureUrl'] ?? ownerObj?['avatarUrl'] ?? json['ownerAvatar'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'title': title,
      'description': description,
      'location': location,
      'rent': rent,
      'propertyType': propertyType,
      'availableFrom': availableFrom,
      'address': address,
      'numberOfPeople': numberOfPeople,
      'genderPreference': genderPreference ?? 'Both',
      'suitableFor': suitableFor ?? 'Any',
      'bedrooms': bedrooms,
      'kitchens': kitchens,
      'bathrooms': bathrooms,
      'floor': floor,
      'furnished': furnished,
      'parking': parking,
      'petsAllowed': petsAllowed,
      'mapEmbedUrl': mapEmbedUrl,
      'offers': offers,
      'highlights': highlights,
      'rules': rules,
      'nearby': nearby,
      'images': images,
      'badge': badge,
      'rating': rating,
      if (ownerId != null) 'owner': {'id': ownerId},
    };
  }
}
