package com.b7g2_08.blooddonationsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BloodDonationSystemApplication {

    static void main(String[] args) {
        SpringApplication.run(BloodDonationSystemApplication.class, args);
        System.out.println("\u001B[1;96m" + "--And we're live!--" + "\u001B[0;37m");
    }

}
