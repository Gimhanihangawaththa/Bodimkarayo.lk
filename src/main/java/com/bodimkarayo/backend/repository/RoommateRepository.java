package com.bodimkarayo.backend.repository;

import com.bodimkarayo.backend.model.RoommatePost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoommateRepository<RoommatePost> extends JpaRepository<RoommatePost, Long> {
    List<RoommatePost> findByLocationContaining(String location);
}
