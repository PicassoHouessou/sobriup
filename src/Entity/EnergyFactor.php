<?php

namespace App\Entity;

use App\Repository\EnergyFactorRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EnergyFactorRepository::class)]
class EnergyFactor
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;
    #[ORM\Column(length: 50)]
    private string $energyType;
    // gaz, electricite, reseau_chaleur, hybride

    #[ORM\Column]
    private float $co2Factor;
    // kgCO2 / kWh

    #[ORM\Column(nullable: true)]
    private ?float $primaryEnergyFactor = null;
    // kWhEP / kWh

    #[ORM\Column(nullable: true)]
    private ?float $costPerKwh = null;
    // € / kWh

    #[ORM\Column(type: 'date')]
    private \DateTimeInterface $validFrom;

    #[ORM\Column(type: 'date', nullable: true)]
    private ?\DateTimeInterface $validTo = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCo2Factor(): float
    {
        return $this->co2Factor;
    }

    public function setCo2Factor(float $co2Factor): static
    {
        $this->co2Factor = $co2Factor;
        return $this;
    }

    public function getPrimaryEnergyFactor(): ?float
    {
        return $this->primaryEnergyFactor;
    }

    public function setPrimaryEnergyFactor(?float $primaryEnergyFactor): static
    {
        $this->primaryEnergyFactor = $primaryEnergyFactor;
        return $this;
    }

    public function getValidTo(): ?\DateTimeInterface
    {
        return $this->validTo;
    }

    public function setValidTo(?\DateTimeInterface $validTo): static
    {
        $this->validTo = $validTo;
        return $this;
    }

    public function getValidFrom(): \DateTimeInterface
    {
        return $this->validFrom;
    }

    public function setValidFrom(\DateTimeInterface $validFrom): static
    {
        $this->validFrom = $validFrom;
        return $this;
    }

    public function getEnergyType(): string
    {
        return $this->energyType;
    }

    public function setEnergyType(string $energyType): static
    {
        $this->energyType = $energyType;
        return $this;
    }

    public function getCostPerKwh(): ?float
    {
        return $this->costPerKwh;
    }

    public function setCostPerKwh(?float $costPerKwh): static
    {
        $this->costPerKwh = $costPerKwh;
        return $this;
    }
}
