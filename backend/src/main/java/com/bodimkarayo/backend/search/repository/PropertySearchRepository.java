package com.bodimkarayo.backend.search.repository;

import com.bodimkarayo.backend.search.document.PropertySearchDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface PropertySearchRepository extends ElasticsearchRepository<PropertySearchDocument, Long> {
}
