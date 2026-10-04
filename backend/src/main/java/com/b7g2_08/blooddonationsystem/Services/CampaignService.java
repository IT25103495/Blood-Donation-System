package com.b7g2_08.blooddonationsystem.Services;

import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignGetStatusDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignUpdateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignUpdateStatusDTO;
import com.b7g2_08.blooddonationsystem.Enums.campStatus;
import com.b7g2_08.blooddonationsystem.Enums.userType;
import com.b7g2_08.blooddonationsystem.Models.AuthEntity;
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


    public @ResponseBody String addNewCampaign(campaignCreateDTO campaignCreateDTO, AuthEntity me) {

        Campaign campaign = new Campaign();
        Hoster hoster = resolveCreatingHoster(campaignCreateDTO, me);
        Set<Venue> venueSet = new HashSet<>();
        // Venues are optional at creation time; they can be added to the campaign later.
        if (campaignCreateDTO.getVenueIDs() != null) {
            for (Integer venueID : campaignCreateDTO.getVenueIDs()) {
                Venue venue = venueRepository.findById(venueID)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue Not Found: " + venueID));
                venueSet.add(venue);
            }
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
    public @ResponseBody campaignGetStatusDTO getCampaignStatus(Integer campId, AuthEntity me) {
        Campaign camp = getVisibleCampaign(campId, me);

        return new campaignGetStatusDTO(camp.getStatus());
    }

    @Transactional
    public @ResponseBody String updateCampaignStatus(Integer campId, campaignUpdateStatusDTO campaignStatusUpdateDTO) {
        Campaign campaign = campaignRepository.findById(campId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campaign Not Found"));

        campaign.setStatus(campaignStatusUpdateDTO.getStatus());
        campaignRepository.save(campaign);
        return "Status Updated";
    }

    @Transactional
    public @ResponseBody String assignVenue(int campID, int venueID, AuthEntity me) {
        Campaign camp = campaignRepository.findById(campID).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campaign Not Found"));
        if (!isAdmin(me) && !isOwner(camp, me)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your campaign");
        }
        Venue venue = venueRepository.findById(venueID).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue Not Found"));

        Set<Venue> set = camp.getVenueSet();
        set.add(venue);
        camp.setVenueSet(set);

        campaignRepository.save(camp);

        return "Venue Assigned";
    }

    @Transactional
    public @ResponseBody String updateCampaign(Integer campId, campaignUpdateDTO campaignUpdateDTO) {

        Campaign campaign = campaignRepository.findById(campId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campaign Not Found"));

        // Partial update: only fields present in the request are applied, everything else keeps its current value.
        if (campaignUpdateDTO.getName() != null) {
            campaign.setName(campaignUpdateDTO.getName());
        }
        if (campaignUpdateDTO.getStartDate() != null) {
            campaign.setStartDate(campaignUpdateDTO.getStartDate());
        }
        if (campaignUpdateDTO.getEndDate() != null) {
            campaign.setEndDate(campaignUpdateDTO.getEndDate());
        }
        if (campaignUpdateDTO.getHosterID() != null) {
            Hoster hoster = hosterUserRepository.findById(campaignUpdateDTO.getHosterID())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hoster Not Found!"));
            campaign.setHoster(hoster);
        }
        if (campaignUpdateDTO.getVenueIDs() != null) {
            Set<Venue> venueSet = new HashSet<>();
            for (Integer venueID : campaignUpdateDTO.getVenueIDs()) {
                Venue venue = venueRepository.findById(venueID)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue Not Found: " + venueID));
                venueSet.add(venue);
            }
            campaign.setVenueSet(venueSet);
        }
        if (campaignUpdateDTO.getStatus() != null) {
            campaign.setStatus(campaignUpdateDTO.getStatus());
        }

        campaignRepository.save(campaign);
        return "Updated";
    }

    @Transactional
    public String deleteCampaign(Integer campID) {
        Campaign campaign = campaignRepository.findById(campID)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campaign Not Found"));

        campaignRepository.delete(campaign);
        return "Deleted";
    }

    // A hoster always creates for itself; an admin must name the host the campaign belongs to.
    private Hoster resolveCreatingHoster(campaignCreateDTO campaignCreateDTO, AuthEntity me) {
        if (me.getHoster() != null) {
            return me.getHoster();
        }
        if (!isAdmin(me)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only hosters can create campaigns");
        }
        if (campaignCreateDTO.getHosterID() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "hosterID is required when an admin creates a campaign");
        }
        return hosterUserRepository.findById(campaignCreateDTO.getHosterID())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hoster Not Found!"));
    }

    private boolean isAdmin(AuthEntity me) {
        return me.getUserType() == userType.ADMIN;
    }

    private boolean isOwner(Campaign camp, AuthEntity me) {
        return me.getHoster() != null && camp.getHoster().getID().equals(me.getHoster().getID());
    }

    // Non-approved campaigns are visible only to admins and the owning hoster (404 to avoid leaking existence)
    @Transactional
    public Campaign getVisibleCampaign(Integer campId, AuthEntity me) {
        Campaign camp = campaignRepository.findById(campId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campaign Not Found"));
        if (camp.getStatus() != campStatus.APPROVED && !isAdmin(me) && !isOwner(camp, me)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Campaign Not Found");
        }
        return camp;
    }

    @Transactional
    public Iterable<Campaign> getCampaignsByHoster(Integer hosterID, AuthEntity me) {
        if (!isAdmin(me) && (me.getHoster() == null || !me.getHoster().getID().equals(hosterID))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your campaigns");
        }
        return campaignRepository.findByHoster_ID(hosterID);
    }

    @Transactional
    public @ResponseBody Iterable<Campaign> getAllApprovedCampaigns() {
        return campaignRepository.findByStatus(campStatus.APPROVED);
    }
}
