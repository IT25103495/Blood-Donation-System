package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignCreateDTO;
import com.b7g2_08.blooddonationsystem.Enums.campStatus;
import com.b7g2_08.blooddonationsystem.Models.Campaign;
import com.b7g2_08.blooddonationsystem.Repos.CampaignRepository;
import com.b7g2_08.blooddonationsystem.Services.CampaignService;
import com.b7g2_08.blooddonationsystem.Services.InventoryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@CrossOrigin
@SecurityRequirement(name = "bearerAuth")
@RequestMapping(path = "/Campaign")
public class CampaignController {

    @Autowired
    private CampaignRepository campaignRepository;
    @Autowired
    private CampaignService campaignService;

    @PostMapping("/add")
    public @ResponseBody String addNewCampaign(@RequestBody campaignCreateDTO campaign) {
        return campaignService.addNewCampaign(campaign);
    }

    @GetMapping("getAll")
    public @ResponseBody Iterable<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    @GetMapping("/getById")
    public @ResponseBody ResponseEntity<Campaign> getCampaignById(@RequestParam int id) {
        return campaignRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/updateStatus")
    public @ResponseBody String updateStatus(@RequestParam int campId, @RequestParam campStatus status) {
        return campaignService.updateCampaignStatus(campId, status);

    }

    @GetMapping("/getByHoster")
    public @ResponseBody Iterable<Campaign> getCampaignsByHoster(@RequestParam Integer hosterID) {
        return campaignRepository.findByHoster_ID(hosterID);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete")
    public @ResponseBody String deleteCampaign(@RequestParam Integer campID) {
        return campaignService.deleteCampaign(campID);
    }
}
