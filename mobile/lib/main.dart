import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/property_provider.dart';
import 'providers/roommate_provider.dart';
import 'providers/review_provider.dart';
import 'providers/chat_provider.dart';
import 'providers/search_provider.dart';
import 'providers/recommendation_provider.dart';
import 'theme/app_theme.dart';
import 'screens/main_screen.dart';
import 'screens/auth/sign_in_screen.dart';
import 'screens/auth/sign_up_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..tryAutoLogin()),
        ChangeNotifierProvider(create: (_) => PropertyProvider()..fetchProperties()),
        ChangeNotifierProvider(create: (_) => RoommateProvider()..fetchRoommates()),
        ChangeNotifierProvider(create: (_) => ReviewProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),
        ChangeNotifierProvider(create: (_) => SearchProvider()),
        ChangeNotifierProvider(create: (_) => RecommendationProvider()),
      ],
      child: const BodimkarayoApp(),
    ),
  );
}

class BodimkarayoApp extends StatelessWidget {
  const BodimkarayoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Bodimkarayo',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: '/',
      routes: {
        '/': (context) => const MainScreen(),
        '/signin': (context) => const SignInScreen(),
        '/signup': (context) => const SignUpScreen(),
      },
    );
  }
}
