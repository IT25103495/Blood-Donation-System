package com.b7g2_08.blooddonationsystem.Services;

import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignCreateDTO;
import com.b7g2_08.blooddonationsystem.Models.Campaign;
import com.b7g2_08.blooddonationsystem.Models.Users.Hoster;
import com.b7g2_08.blooddonationsystem.Repos.CampaignRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.HosterUserRepository;
import com.b7g2_08.blooddonationsystem.Repos.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.ResponseBody;

public class CampaignService {

    @Autowired
    private CampaignRepository campaignRepository;
    @Autowired
    private HosterUserRepository hosterUserRepository;
    @Autowired
    private VenueRepository venueRepository;


    public @ResponseBody String addNewCampaign(campaignCreateDTO campaignCreateDTO) {

        Campaign campaign = new Campaign();

        return "Success";
    }
}
