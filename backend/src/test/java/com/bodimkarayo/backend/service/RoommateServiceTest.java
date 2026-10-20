package com.bodimkarayo.backend.service;

import com.bodimkarayo.backend.model.RoommatePost;
import com.bodimkarayo.backend.model.User;
import com.bodimkarayo.backend.repository.RoommateRepository;
import com.bodimkarayo.backend.search.SearchIndexService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoommateServiceTest {

    @Mock
    private RoommateRepository roommateRepository;

    @Mock
    private SearchIndexService searchIndexService;

    @InjectMocks
    private RoommateService roommateService;

    private RoommatePost testPost;
    private User testPoster;

    @BeforeEach
    void setUp() {
        testPoster = User.builder()
                .id(1L)
                .fullName("Gimhani Hangawaththa")
                .email("gimshi@gmail.com")
                .build();

        testPost = RoommatePost.builder()
                .id(5L)
                .gender("Female")
                .age(24)
                .occupation("Software Engineer")
                .location("Moratuwa")
                .preferredLocation("Katubedda")
                .bio("Looking for a quiet room near university")
                .about("Clean, friendly, non-smoker")
                .interests("Coding, Reading, Music")
                .preferences("Non-smoking, Pet-friendly")
                .moveInDate("2026-11-01")
                .budget(20000.0)
                .poster(testPoster)
                .build();
    }

    @Test
    @DisplayName("Should return all roommate posts")
    void getAllPosts_ReturnsList() {
        when(roommateRepository.findAll()).thenReturn(List.of(testPost));

        List<RoommatePost> posts = roommateService.getAllPosts();

        assertNotNull(posts);
        assertEquals(1, posts.size());
        assertEquals("Moratuwa", posts.get(0).getLocation());
        verify(roommateRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return roommate post by ID when found")
    void getPostById_Found() {
        when(roommateRepository.findById(5L)).thenReturn(Optional.of(testPost));

        Optional<RoommatePost> result = roommateService.getPostById(5L);

        assertTrue(result.isPresent());
        assertEquals(5L, result.get().getId());
        assertEquals(24, result.get().getAge());
    }

    @Test
    @DisplayName("Should return empty optional when roommate post is not found")
    void getPostById_NotFound() {
        when(roommateRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<RoommatePost> result = roommateService.getPostById(999L);

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should save roommate post and sync with search index")
    void createPost_Success() {
        when(roommateRepository.save(any(RoommatePost.class))).thenReturn(testPost);

        RoommatePost created = roommateService.createPost(testPost);

        assertNotNull(created);
        assertEquals(5L, created.getId());
        verify(roommateRepository, times(1)).save(testPost);
        verify(searchIndexService, times(1)).syncRoommate(testPost);
    }

    @Test
    @DisplayName("Should update roommate post and update search index")
    void updatePost_Success() throws Throwable {
        RoommatePost updatedInput = RoommatePost.builder()
                .gender("Female")
                .age(25)
                .occupation("Senior Engineer")
                .location("Colombo 07")
                .preferredLocation("Colombo 07")
                .bio("Updated bio info")
                .budget(25000.0)
                .poster(testPoster)
                .build();

        when(roommateRepository.findById(5L)).thenReturn(Optional.of(testPost));
        when(roommateRepository.save(any(RoommatePost.class))).thenReturn(testPost);

        RoommatePost result = roommateService.updatePost(5L, updatedInput);

        assertNotNull(result);
        assertEquals(25, testPost.getAge());
        assertEquals("Senior Engineer", testPost.getOccupation());
        assertEquals("Colombo 07", testPost.getLocation());
        verify(roommateRepository, times(1)).save(testPost);
        verify(searchIndexService, times(1)).syncRoommate(testPost);
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent post")
    void updatePost_NotFound_ThrowsException() {
        when(roommateRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> roommateService.updatePost(999L, testPost));
        verify(roommateRepository, never()).save(any(RoommatePost.class));
    }

    @Test
    @DisplayName("Should delete roommate post and remove from search index")
    void deletePost_Success() {
        doNothing().when(roommateRepository).deleteById(5L);

        roommateService.deletePost(5L);

        verify(roommateRepository, times(1)).deleteById(5L);
        verify(searchIndexService, times(1)).removeRoommate(5L);
    }

    @Test
    @DisplayName("Should delegate search to searchIndexService when available")
    void searchRoommates_DelegatesToSearchIndex() {
        when(searchIndexService.searchRoommates(
                eq("gimhani"), eq("Moratuwa"), isNull(), eq("Female"),
                eq("Software Engineer"), isNull(), isNull(),
                isNull(), isNull(), isNull(),
                eq(10000.0), eq(30000.0)
        )).thenReturn(List.of(testPost));

        List<RoommatePost> results = roommateService.searchRoommates(
                "gimhani", "Moratuwa", "Female",
                null, null, "Software Engineer",
                null, null, null, null,
                10000.0, 30000.0
        );

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Gimhani Hangawaththa", results.get(0).getPoster().getFullName());
    }

    @Test
    @DisplayName("Should fallback to database search matching poster full name in keyword")
    void searchRoommates_FallbackMatchesPosterName() {
        // Force searchIndexService to fail to test database fallback
        when(searchIndexService.searchRoommates(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenThrow(new RuntimeException("Search index offline"));
        when(roommateRepository.findAll()).thenReturn(List.of(testPost));

        List<RoommatePost> results = roommateService.searchRoommates(
                "Gimhani", null, null,
                null, null, null,
                null, null, null, null,
                null, null
        );

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Gimhani Hangawaththa", results.get(0).getPoster().getFullName());
    }
}
