package com.b7g2_08.blooddonationsystem.DTOs.Inventory;

import com.b7g2_08.blooddonationsystem.Enums.itemStatus;

public class inventoryStatusDTO {
    protected Integer itemID;
    protected itemStatus status;

    public Integer getItemID() {
        return itemID;
    }

    public itemStatus getStatus() {
        return status;
    }
}
