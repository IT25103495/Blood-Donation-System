package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Campaign.campaignCreateDTO;
import com.b7g2_08.blooddonationsystem.Models.Campaign;
import com.b7g2_08.blooddonationsystem.Repos.CampaignRepository;
import com.b7g2_08.blooddonationsystem.Services.CampaignService;
import com.b7g2_08.blooddonationsystem.Services.InventoryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
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


}
