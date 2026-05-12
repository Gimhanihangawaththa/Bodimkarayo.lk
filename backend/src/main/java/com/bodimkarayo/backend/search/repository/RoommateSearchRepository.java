package com.bodimkarayo.backend.search.repository;

import com.bodimkarayo.backend.search.document.RoommateSearchDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface RoommateSearchRepository extends ElasticsearchRepository<RoommateSearchDocument, Long> {
}
