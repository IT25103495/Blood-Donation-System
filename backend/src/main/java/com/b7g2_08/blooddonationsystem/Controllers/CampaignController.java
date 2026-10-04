package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignCreateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignGetStatusDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignUpdateDTO;
import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignUpdateStatusDTO;
import com.b7g2_08.blooddonationsystem.Models.AuthEntity;
import com.b7g2_08.blooddonationsystem.Models.Campaign;
import com.b7g2_08.blooddonationsystem.Repos.CampaignRepository;
import com.b7g2_08.blooddonationsystem.Services.CampaignService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    // A hoster creates its own campaign; an admin creates one on behalf of a host (hosterID in the body).
    @PreAuthorize("hasAnyRole('HOSTER','ADMIN')")
    @PostMapping()
    public @ResponseBody String addNewCampaign(@Valid @RequestBody campaignCreateDTO campaign, @AuthenticationPrincipal AuthEntity me) {
        return campaignService.addNewCampaign(campaign, me);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    public @ResponseBody Iterable<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    @GetMapping("/public")
    public @ResponseBody Iterable<Campaign> getAllApprovedCampaigns() {
        return campaignService.getAllApprovedCampaigns();
    }


    @GetMapping("/{id}")
    public @ResponseBody Campaign getCampaignById(@PathVariable int id, @AuthenticationPrincipal AuthEntity me) {
        return campaignService.getVisibleCampaign(id, me);
    }

    //view campaign status
    @GetMapping("/{id}/status")
    public @ResponseBody campaignGetStatusDTO getStatus(@PathVariable int id, @AuthenticationPrincipal AuthEntity me) {
        return campaignService.getCampaignStatus(id, me);
    }

    //update campaign status
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/status")
    public @ResponseBody String updateStatus(@PathVariable int id, @Valid @RequestBody campaignUpdateStatusDTO status) {
        return campaignService.updateCampaignStatus(id, status);

    }

    //assign venue to a campaign (admin or owning hoster)
    @PreAuthorize("hasAnyRole('ADMIN','HOSTER')")
    @PutMapping("/venue")
    public @ResponseBody String assignVenue(@RequestParam int campID, @RequestParam int venueID, @AuthenticationPrincipal AuthEntity me) {
        return campaignService.assignVenue(campID, venueID, me);

    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public @ResponseBody String updateCampaign(@PathVariable int id, @Valid @RequestBody campaignUpdateDTO campaignUpdateDTO) {
        return campaignService.updateCampaign(id, campaignUpdateDTO);

    }

    @PreAuthorize("hasAnyRole('ADMIN','HOSTER')")
    @GetMapping("/hoster/{hosterID}")
    public @ResponseBody Iterable<Campaign> getCampaignsByHoster(@PathVariable Integer hosterID, @AuthenticationPrincipal AuthEntity me) {
        return campaignService.getCampaignsByHoster(hosterID, me);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public @ResponseBody String deleteCampaign(@PathVariable Integer id) {
        return campaignService.deleteCampaign(id);
    }
}
