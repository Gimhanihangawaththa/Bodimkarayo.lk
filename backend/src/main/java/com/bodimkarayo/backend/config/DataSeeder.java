package com.bodimkarayo.backend.config;

import com.bodimkarayo.backend.model.Property;
import com.bodimkarayo.backend.model.RoommatePost;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.PropertyRepository;
import com.bodimkarayo.backend.repository.RoommateRepository;
import com.bodimkarayo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private RoommateRepository roommateRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedAdmins();
        seedUsers();
        seedProperties();
        seedRoommates();
    }

    private void seedAdmins() {
        createAdminIfNotExists("Admin One", "admin1@bodimkarayo.lk", "admin123");
        createAdminIfNotExists("Admin Two", "admin2@bodimkarayo.lk", "admin123");
        createAdminIfNotExists("Admin Three", "admin3@bodimkarayo.lk", "admin123");
        createAdminIfNotExists("Admin Four", "admin4@bodimkarayo.lk", "admin123");
        System.out.println("✓ Admin accounts initialized");
    }

    private void seedUsers() {
        createUserIfNotExists("Kasun Perera", "kasun.perera@gmail.com", "user123");
        createUserIfNotExists("Dinithi Silva", "dinithi.silva@gmail.com", "user123");
        createUserIfNotExists("Tharindu Bandara", "tharindu.bandara@gmail.com", "user123");
        createUserIfNotExists("Nimna Jayawardena", "nimna.jaya@gmail.com", "user123");
        createUserIfNotExists("Sandun Fernando", "sandun.fernando@gmail.com", "user123");
        System.out.println("✓ Sample user accounts verified");
    }

    private User createAdminIfNotExists(String fullName, String email, String password) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User admin = User.builder()
                    .fullName(fullName)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role("ADMIN")
                    .verified(true)
                    .isActive(true)
                    .build();
            return userRepository.save(admin);
        });
    }

    private User createUserIfNotExists(String fullName, String email, String password) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = User.builder()
                    .fullName(fullName)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role("USER")
                    .verified(true)
                    .isActive(true)
                    .build();
            return userRepository.save(user);
        });
    }

    private void seedProperties() {
        if (propertyRepository.count() >= 5) {
            System.out.println("✓ Properties already seeded (" + propertyRepository.count() + " present)");
            return;
        }

        User owner = userRepository.findByEmail("admin1@bodimkarayo.lk")
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));

        List<Property> samples = new ArrayList<>();

        // 1. Moratuwa Student Annex
        samples.add(Property.builder()
                .title("Cozy Student Annex near Moratuwa University")
                .description("Comfortable, quiet single room annex specifically for Moratuwa university students. Highly secure neighborhood with separate entrance and study desk.")
                .location("Moratuwa")
                .rent(18000.0)
                .propertyType("Single Room")
                .availableFrom("2026-11-01")
                .address("No. 45, Bandaranayake Mawatha, Katubedda, Moratuwa")
                .numberOfPeople("1 Person")
                .genderPreference("Male")
                .suitableFor("University Students")
                .bedrooms(1)
                .kitchens(1)
                .bathrooms(1)
                .floor("Ground Floor")
                .furnished("Fully Furnished")
                .parking("Bicycle / Bike")
                .petsAllowed("No")
                .mapEmbedUrl("https://maps.google.com")
                .offers(Arrays.asList("WiFi", "Water Bill Included", "Study Table", "Separate Entrance", "Ceiling Fan"))
                .highlights(Arrays.asList("500m to UoM Main Gate", "Quiet study environment", "Walking distance to Katubedda junction"))
                .rules(Arrays.asList("No smoking", "Quiet hours after 10 PM", "No alcohol on premises"))
                .nearby(Arrays.asList("University of Moratuwa", "Katubedda Junction", "Food City Katubedda", "Bus Halt 255/100"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
                        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
                ))
                .owner(owner)
                .build());

        // 2. Colombo 03 Luxury Apartment
        samples.add(Property.builder()
                .title("Executive Single Room in Luxury Kollupitiya Apartment")
                .description("High-end ocean view room in a modern apartment complex on Marine Drive. Perfect for corporate employees and working professionals.")
                .location("Colombo 03")
                .rent(45000.0)
                .propertyType("Apartment")
                .availableFrom("2026-11-15")
                .address("Marine Drive, Kollupitiya, Colombo 03")
                .numberOfPeople("1 Person")
                .genderPreference("Both")
                .suitableFor("Working Professionals")
                .bedrooms(1)
                .kitchens(1)
                .bathrooms(1)
                .floor("4th Floor")
                .furnished("Fully Furnished")
                .parking("Car Parking Available")
                .petsAllowed("No")
                .mapEmbedUrl("https://maps.google.com")
                .offers(Arrays.asList("AC", "High Speed Fiber WiFi", "Hot Water", "Washing Machine", "Gym Access", "24/7 Security"))
                .highlights(Arrays.asList("Sea view from balcony", "Walking distance to Kollupitiya Railway Station", "Next to supermarkets & cafes"))
                .rules(Arrays.asList("Maintain cleanliness", "Visitors allowed during daytime only"))
                .nearby(Arrays.asList("Liberty Plaza", "Kollupitiya Station", "Cargills Food City", "Galle Face Green"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
                        "https://images.unsplash.com/photo-1502005229762-ee152da7c5d6?w=800"
                ))
                .owner(owner)
                .build());

        // 3. Kelaniya Ladies Bodim
        samples.add(Property.builder()
                .title("Safe & Friendly Boarding Room for Girls in Kelaniya")
                .description("Secure and pleasant residential boarding house for female undergraduates studying at University of Kelaniya. Homely atmosphere with home-cooked meals option.")
                .location("Kelaniya")
                .rent(15000.0)
                .propertyType("Shared Room")
                .availableFrom("2026-11-01")
                .address("No. 12, Kandy Road, Dalugama, Kelaniya")
                .numberOfPeople("2 People")
                .genderPreference("Female")
                .suitableFor("University Students")
                .bedrooms(2)
                .kitchens(1)
                .bathrooms(1)
                .floor("1st Floor")
                .furnished("Furnished")
                .parking("Bike Parking")
                .petsAllowed("No")
                .mapEmbedUrl("https://maps.google.com")
                .offers(Arrays.asList("Electricity & Water Included", "Attached Bathroom", "Cooking Facilities", "Study Area"))
                .highlights(Arrays.asList("300m to University of Kelaniya", "CCTV protected premises", "Safe residential neighborhood"))
                .rules(Arrays.asList("Female occupants only", "Return before 8:30 PM", "No outsiders without permission"))
                .nearby(Arrays.asList("University of Kelaniya", "Dalugama Junction", "Kandy Road Bus Stop", "Kelaniya Hospital"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
                        "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800"
                ))
                .owner(owner)
                .build());

        // 4. Malabe IT Hub Studio Annex
        samples.add(Property.builder()
                .title("Modern Studio Annex near SLIIT & Horizon Malabe")
                .description("Contemporary independent studio with dedicated workstation, ultra-fast fiber internet, and green surroundings. Walking distance to SLIIT bus halt.")
                .location("Malabe")
                .rent(28000.0)
                .propertyType("Studio")
                .availableFrom("2026-11-10")
                .address("New Kandy Road, Kaduwela / Malabe")
                .numberOfPeople("1 or 2 People")
                .genderPreference("Both")
                .suitableFor("University Students & Tech Professionals")
                .bedrooms(1)
                .kitchens(1)
                .bathrooms(1)
                .floor("Ground Floor")
                .furnished("Semi-Furnished")
                .parking("Car & Bike Parking")
                .petsAllowed("Yes")
                .mapEmbedUrl("https://maps.google.com")
                .offers(Arrays.asList("Fiber Internet", "Balcony", "Separate Electricity Meter", "Kitchenette"))
                .highlights(Arrays.asList("5 mins drive to SLIIT campus", "Peaceful green surroundings", "Spacious and private"))
                .rules(Arrays.asList("Respect neighbors", "Keep common areas clean"))
                .nearby(Arrays.asList("SLIIT Malabe", "Horizon Campus", "CINEC Campus", "Nevill Fernando Hospital"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
                        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800"
                ))
                .owner(owner)
                .build());

        // 5. Peradeniya Mountain View Annex Kandy
        samples.add(Property.builder()
                .title("Peradeniya University Annex with Mountain View")
                .description("Charming hillside annex overlooking the Mahaweli valley. Just 10 minutes to the Peradeniya Engineering and Medical faculties. Very calm atmosphere.")
                .location("Kandy")
                .rent(16000.0)
                .propertyType("Single Room")
                .availableFrom("2026-11-01")
                .address("Galaha Road, Peradeniya, Kandy")
                .numberOfPeople("1 Person")
                .genderPreference("Male")
                .suitableFor("University Students")
                .bedrooms(1)
                .kitchens(1)
                .bathrooms(1)
                .floor("Upper Floor")
                .furnished("Furnished")
                .parking("Bike Parking")
                .petsAllowed("No")
                .mapEmbedUrl("https://maps.google.com")
                .offers(Arrays.asList("Scenic Mountain View", "Free WiFi", "Hot Water Shower", "Study Desk"))
                .highlights(Arrays.asList("Walking distance to Engineering Faculty", "Cool mountain breeze", "Serene study environment"))
                .rules(Arrays.asList("No loud music", "No smoking inside the room"))
                .nearby(Arrays.asList("University of Peradeniya", "Peradeniya Railway Station", "Botanical Gardens", "Galaha Junction"))
                .images(Arrays.asList(
                        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
                        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800"
                ))
                .owner(owner)
                .build());

        propertyRepository.saveAll(samples);
        System.out.println("✓ 5 sample properties seeded successfully");
    }

    private void seedRoommates() {
        if (roommateRepository.count() >= 5) {
            System.out.println("✓ Roommate posts already seeded (" + roommateRepository.count() + " present)");
            return;
        }

        User u1 = userRepository.findByEmail("kasun.perera@gmail.com").orElse(null);
        User u2 = userRepository.findByEmail("dinithi.silva@gmail.com").orElse(null);
        User u3 = userRepository.findByEmail("tharindu.bandara@gmail.com").orElse(null);
        User u4 = userRepository.findByEmail("nimna.jaya@gmail.com").orElse(null);
        User u5 = userRepository.findByEmail("sandun.fernando@gmail.com").orElse(null);

        List<RoommatePost> posts = new ArrayList<>();

        // 1. Moratuwa Student
        posts.add(RoommatePost.builder()
                .gender("Male")
                .age(22)
                .occupation("Undergraduate (University of Moratuwa)")
                .location("Moratuwa")
                .preferredLocation("Katubedda, Moratuwa, Ratmalana")
                .budget(20000.0)
                .moveInDate("2026-11-01")
                .bio("3rd year UoM Engineering undergrad looking for a clean single room or shared annex with quiet study atmosphere near campus.")
                .about("Studying Computer Science & Engineering. Passionate about AI and robotics. Non-smoker, clean, and respectful.")
                .interests("Coding, Gaming, Gym, Robotics")
                .preferences("Non-smoker, quiet study hours, close to UoM")
                .poster(u1)
                .build());

        // 2. Colombo 03 Professional
        posts.add(RoommatePost.builder()
                .gender("Female")
                .age(24)
                .occupation("Digital Marketing Specialist")
                .location("Colombo 03")
                .preferredLocation("Kollupitiya, Bambalapitiya, Colombo 04")
                .budget(40000.0)
                .moveInDate("2026-11-15")
                .bio("Working professional at a multinational agency in Colombo. Looking for a neat apartment roommate or studio room near Galle Road.")
                .about("Friendly, organized, loves interior decorating and cooking on weekends. Values privacy and mutual respect.")
                .interests("Reading, Yoga, Cooking, Podcasts")
                .preferences("Female roommate preferred, hygienic, non-smoker")
                .poster(u2)
                .build());

        // 3. Kandy Medical Student
        posts.add(RoommatePost.builder()
                .gender("Male")
                .age(23)
                .occupation("Medical Student (University of Peradeniya)")
                .location("Kandy")
                .preferredLocation("Peradeniya, Kandy, Galaha Road")
                .budget(18000.0)
                .moveInDate("2026-11-01")
                .bio("4th year Peradeniya medical student needing a quiet annex with reliable internet and study desk for late night study.")
                .about("Spends most weekdays at hospital rounds and faculty library. Very quiet and calm lifestyle.")
                .interests("Medicine, Badminton, Classical Music, Chess")
                .preferences("Strictly quiet environment, reliable water and electricity")
                .poster(u3)
                .build());

        // 4. Kelaniya Female Student
        posts.add(RoommatePost.builder()
                .gender("Female")
                .age(21)
                .occupation("Undergraduate (University of Kelaniya)")
                .location("Kelaniya")
                .preferredLocation("Dalugama, Kelaniya, Kiribathgoda")
                .budget(16000.0)
                .moveInDate("2026-11-05")
                .bio("Looking for a boarding place or female roommate to share an annex near Kelaniya University. Friendly and easy to get along with.")
                .about("Studying English Literature and Linguistics. Loves books, cats, and making friends.")
                .interests("Literature, Art, Photography, Baking")
                .preferences("Female only, safe residential neighborhood, cooking allowed")
                .poster(u4)
                .build());

        // 5. Malabe Software Developer
        posts.add(RoommatePost.builder()
                .gender("Male")
                .age(25)
                .occupation("Full Stack Software Developer")
                .location("Malabe")
                .preferredLocation("Malabe, Kaduwela, Battaramulla")
                .budget(30000.0)
                .moveInDate("2026-11-10")
                .bio("Remote software engineer working for a tech firm. Seeking a modern annex or roommate with high-speed fiber internet and parking.")
                .about("Tech enthusiast who works US hours occasionally. Quiet, respectful, and loves gaming and coffee.")
                .interests("Software Development, Mechanical Keyboards, Gaming, Coffee brewing")
                .preferences("Fast fiber internet is a must, parking space for vehicle")
                .poster(u5)
                .build());

        roommateRepository.saveAll(posts);
        System.out.println("✓ 5 sample roommate posts seeded successfully");
    }
}

