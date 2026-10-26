import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:provider/provider.dart';
import 'home/home_screen.dart';
import 'properties/properties_screen.dart';
import 'roommates/roommates_screen.dart';
import 'chat/chat_list_screen.dart';
import 'profile/profile_screen.dart';
import 'properties/add_property_screen.dart';
import '../providers/chat_provider.dart';
import '../providers/auth_provider.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    PropertiesScreen(),
    RoommatesScreen(),
    ChatListScreen(),
    ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authUser = context.read<AuthProvider>().user;
      if (authUser != null && authUser.id != null) {
        context.read<ChatProvider>().fetchUnreadCount(authUser.id!);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = context.watch<ChatProvider>().unreadCount;

    return Scaffold(
      extendBody: true,
      body: Stack(
        children: [
          // Background Gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xFFE0F2FE),
                  Colors.white,
                ],
                stops: [0.0, 1.0],
              ),
            ),
          ),
          _screens[_currentIndex],
        ],
      ),
      floatingActionButton: _currentIndex == 1
          ? Padding(
              padding: const EdgeInsets.only(bottom: 15),
              child: FloatingActionButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const AddPropertyScreen()),
                ),
                backgroundColor: const Color(0xFF0A2463),
                child: const Icon(Icons.add, color: Colors.white),
              ),
            )
          : null,
      bottomNavigationBar: Container(
        margin: const EdgeInsets.only(left: 14, right: 14, bottom: 20),
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(30),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(30),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.white.withValues(alpha: 0.5),
                    Colors.white.withValues(alpha: 0.2),
                  ],
                ),
                borderRadius: BorderRadius.circular(30),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.7),
                  width: 1.2,
                ),
              ),
              child: BottomNavigationBar(
                backgroundColor: Colors.transparent,
                elevation: 0,
                currentIndex: _currentIndex,
                onTap: (index) {
                  setState(() {
                    _currentIndex = index;
                  });
                },
                type: BottomNavigationBarType.fixed,
                selectedItemColor: const Color(0xFF0A2463),
                unselectedItemColor: const Color(0xFF3E92CC).withValues(alpha: 0.7),
                showSelectedLabels: true,
                showUnselectedLabels: true,
                selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 10),
                items: [
                  const BottomNavigationBarItem(
                    icon: Icon(Icons.home_outlined),
                    activeIcon: Icon(Icons.home),
                    label: 'Home',
                  ),
                  const BottomNavigationBarItem(
                    icon: Icon(Icons.business_outlined),
                    activeIcon: Icon(Icons.business),
                    label: 'Properties',
                  ),
                  const BottomNavigationBarItem(
                    icon: Icon(Icons.people_outlined),
                    activeIcon: Icon(Icons.people),
                    label: 'Roommates',
                  ),
                  BottomNavigationBarItem(
                    icon: Badge(
                      isLabelVisible: unreadCount > 0,
                      label: Text('$unreadCount'),
                      child: const Icon(Icons.chat_bubble_outline),
                    ),
                    activeIcon: Badge(
                      isLabelVisible: unreadCount > 0,
                      label: Text('$unreadCount'),
                      child: const Icon(Icons.chat_bubble),
                    ),
                    label: 'Chat',
                  ),
                  const BottomNavigationBarItem(
                    icon: Icon(Icons.person_outline),
                    activeIcon: Icon(Icons.person),
                    label: 'Profile',
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
