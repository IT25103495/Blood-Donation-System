package com.b7g2_08.blooddonationsystem.Services;

import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignUpdateDTO;
import com.b7g2_08.blooddonationsystem.Enums.campStatus;
import com.b7g2_08.blooddonationsystem.Models.Campaign;
import com.b7g2_08.blooddonationsystem.Models.Users.Hoster;
import com.b7g2_08.blooddonationsystem.Models.Venue;
import com.b7g2_08.blooddonationsystem.Repos.CampaignRepository;
import com.b7g2_08.blooddonationsystem.Repos.Users.HosterUserRepository;
import com.b7g2_08.blooddonationsystem.Repos.VenueRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;
import java.util.HashSet;
import java.util.Set;

@Service
public class CampaignService {

    @Autowired
    private CampaignRepository campaignRepository;
    @Autowired
    private HosterUserRepository hosterUserRepository;
    @Autowired
    private VenueRepository venueRepository;


    public @ResponseBody String addNewCampaign(campaignCreateDTO campaignCreateDTO) {

        Campaign campaign = new Campaign();
        Hoster hoster = hosterUserRepository.findById(campaignCreateDTO.getHosterID())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hoster Not Found!"));
        Set<Venue> venueSet = new HashSet<>();
        for (Integer venueID : campaignCreateDTO.getVenueIDs()) {
            Venue venue = venueRepository.findById(venueID)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue Not Found: " + venueID));
            venueSet.add(venue);
        }

        campaign.setName(campaignCreateDTO.getName());
        campaign.setEndDate(campaignCreateDTO.getEndDate());
        campaign.setStartDate(campaignCreateDTO.getStartDate());
        campaign.setStatus(campStatus.PENDING);
        campaign.setHoster(hoster);
        campaign.setVenueSet(venueSet);
        campaignRepository.save(campaign);
        return "Success";
    }

    @Transactional
    public @ResponseBody String updateCampaignStatus(Integer campId, campStatus newStatus) {
        Campaign campaign = campaignRepository.findById(campId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campaign Not Found"));

        campaign.setStatus(newStatus);
        campaignRepository.save(campaign);
        return "Updated";
    }

    public @ResponseBody String updateCampaign(Integer campId, campaignUpdateDTO campaignUpdateDTO) {

        Campaign campaign = campaignRepository.findById(campId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campaign Not Found"));
        Hoster hoster = hosterUserRepository.findById(campaignUpdateDTO.getHosterID())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hoster Not Found!"));
        Set<Venue> venueSet = new HashSet<>();
        for (Integer venueID : campaignUpdateDTO.getVenueIDs()) {
            Venue venue = venueRepository.findById(venueID)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue Not Found: " + venueID));
            venueSet.add(venue);
        }

        campaign.setName(campaignUpdateDTO.getName());
        campaign.setEndDate(campaignUpdateDTO.getEndDate());
        campaign.setStartDate(campaignUpdateDTO.getStartDate());
        campaign.setHoster(hoster);
        campaign.setVenueSet(venueSet);
        campaign.setStatus(campaignUpdateDTO.getStatus());
        campaignRepository.save(campaign);
        return "Updated";
    }

    @Transactional
    public @ResponseBody String deleteCampaign(Integer campID) {
        Campaign campaign = campaignRepository.findById(campID)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campaign Not Found"));

        campaignRepository.delete(campaign);
        return "Deleted";
    }
}
