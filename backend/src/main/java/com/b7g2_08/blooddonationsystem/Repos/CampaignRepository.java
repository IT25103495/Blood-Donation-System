package com.b7g2_08.blooddonationsystem.Repos;

import com.b7g2_08.blooddonationsystem.Models.Campaign;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface CampaignRepository extends CrudRepository<Campaign, Integer>{


}
