package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignGetStatusDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignUpdateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignUpdateStatusDTO;
import com.b7g2_08.blooddonationsystem.Models.Campaign;
import com.b7g2_08.blooddonationsystem.Repos.CampaignRepository;
import com.b7g2_08.blooddonationsystem.Services.CampaignService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@CrossOrigin
@SecurityRequirement(name = "bearerAuth")
@RequestMapping(path = "/api/campaigns")
public class CampaignController {

    @Autowired
    private CampaignRepository campaignRepository;
    @Autowired
    private CampaignService campaignService;

    @PostMapping()
    public @ResponseBody String addNewCampaign(@RequestBody campaignCreateDTO campaign) {
        return campaignService.addNewCampaign(campaign);
    }

    @GetMapping()
    public @ResponseBody Iterable<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    @GetMapping("/public")
    public @ResponseBody Iterable<Campaign> getAllApprovedCampaigns() {
        return campaignService.getAllApprovedCampaigns();
    }


    @GetMapping("/{id}")
    public @ResponseBody ResponseEntity<Campaign> getCampaignById(@PathVariable int id) {
        return campaignRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //view campaign status
    @GetMapping("/{id}/status")
    public @ResponseBody campaignGetStatusDTO getStatus(@PathVariable int id) {
        return campaignService.getCampaignStatus(id);
    }

    //update campaign status
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/status")
    public @ResponseBody String updateStatus(@PathVariable int id, @RequestBody campaignUpdateStatusDTO status) {
        return campaignService.updateCampaignStatus(id, status);

    }

    //assign venue to a campaign
    @PutMapping("/venue")
    public @ResponseBody String assignVenue(@RequestParam int campID, @RequestParam int venueID) {
        return campaignService.assignVenue(campID, venueID);

    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public @ResponseBody String updateCampaign(@PathVariable int id, @RequestBody campaignUpdateDTO campaignUpdateDTO) {
        return campaignService.updateCampaign(id, campaignUpdateDTO);

    }

    @GetMapping("/hoster/{hosterID}")
    public @ResponseBody Iterable<Campaign> getCampaignsByHoster(@PathVariable Integer hosterID) {
        return campaignRepository.findByHoster_ID(hosterID);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public @ResponseBody String deleteCampaign(@PathVariable Integer id) {
        return campaignService.deleteCampaign(id);
    }
}
