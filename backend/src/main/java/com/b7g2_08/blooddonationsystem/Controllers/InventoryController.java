package com.b7g2_08.blooddonationsystem.Controllers;

import com.b7g2_08.blooddonationsystem.DTOs.Inventory.inventoryCreateDTO;
import com.b7g2_08.blooddonationsystem.Repos.InventoryRepository;
import com.b7g2_08.blooddonationsystem.Services.InventoryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@CrossOrigin
@SecurityRequirement(name = "bearerAuth")
@RequestMapping(path="/Inventory")
public class InventoryController {
    //FIXME: May end up unused
    @Autowired
    private InventoryRepository inventoryRepo;
    @Autowired
    private InventoryService inventoryService;

    @PostMapping(path="/add")
    public @ResponseBody String addNewInventory(@RequestBody inventoryCreateDTO item) {
        return inventoryService.addNewInventory(item);
    }
}
