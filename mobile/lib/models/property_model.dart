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
  });

  factory PropertyModel.fromJson(Map<String, dynamic> json) {
    return PropertyModel(
      id: json['id'],
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      location: json['location'] ?? '',
      rent: (json['rent'] as num?)?.toDouble() ?? 0.0,
      propertyType: json['propertyType'],
      availableFrom: json['availableFrom'],
      address: json['address'],
      numberOfPeople: json['numberOfPeople'],
      bedrooms: json['bedrooms'],
      kitchens: json['kitchens'],
      bathrooms: json['bathrooms'],
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
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'location': location,
      'rent': rent,
      'propertyType': propertyType,
      'availableFrom': availableFrom,
      'address': address,
      'numberOfPeople': numberOfPeople,
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
    };
  }
}
