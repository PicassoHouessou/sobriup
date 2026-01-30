<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;
use Psr\Log\LoggerInterface;

/**
 * Service pour récupérer les données météo via Open-Meteo API (gratuite)
 * Documentation : https://open-meteo.com/en/docs
 */
class WeatherService
{
    private const API_URL = 'https://api.open-meteo.com/v1/forecast';

    // Coordonnées par défaut (Dunkerque, France)
    private const DEFAULT_LATITUDE = 51.0343;
    private const DEFAULT_LONGITUDE = 2.3767;

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly LoggerInterface $logger
    ) {
    }

    /**
     * Récupère les données météo actuelles et prévisions
     */
    public function getCurrentWeather(
        float $latitude = self::DEFAULT_LATITUDE,
        float $longitude = self::DEFAULT_LONGITUDE
    ): array {
        try {
            $response = $this->httpClient->request('GET', self::API_URL, [
                'query' => [
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'current' => [
                        'temperature_2m',
                        'relative_humidity_2m',
                        'apparent_temperature',
                        'precipitation',
                        'weather_code',
                        'wind_speed_10m',
                    ],
                    'hourly' => [
                        'temperature_2m',
                        'precipitation_probability',
                    ],
                    'timezone' => 'Europe/Paris',
                    'forecast_days' => 1,
                ],
            ]);

            $data = $response->toArray();

            return [
                'success' => true,
                'current' => [
                    'temperature' => $data['current']['temperature_2m'] ?? null,
                    'feels_like' => $data['current']['apparent_temperature'] ?? null,
                    'humidity' => $data['current']['relative_humidity_2m'] ?? null,
                    'precipitation' => $data['current']['precipitation'] ?? 0,
                    'weather_code' => $data['current']['weather_code'] ?? null,
                    'wind_speed' => $data['current']['wind_speed_10m'] ?? null,
                    'time' => $data['current']['time'] ?? null,
                ],
                'hourly' => [
                    'time' => $data['hourly']['time'] ?? [],
                    'temperature' => $data['hourly']['temperature_2m'] ?? [],
                    'precipitation_probability' => $data['hourly']['precipitation_probability'] ?? [],
                ],
            ];
        } catch (\Exception $e) {
            $this->logger->error('Weather API error: ' . $e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Détermine si les conditions sont favorables pour réduire le chauffage
     */
    public function shouldReduceHeating(): array
    {
        $weather = $this->getCurrentWeather();

        if (!$weather['success']) {
            return ['should_reduce' => false, 'reason' => 'weather_unavailable'];
        }

        $temp = $weather['current']['temperature'];
        $feelsLike = $weather['current']['feels_like'];

        $recommendations = [];

        // 🌡️ Température extérieure élevée
        if ($temp >= 15) {
            $recommendations[] = [
                'action' => 'reduce_heating',
                'priority' => 'high',
                'reason' => "Température extérieure douce ({$temp}°C)",
                'suggestion' => "Réduire le chauffage de 2°C ou l'éteindre",
            ];
        } elseif ($temp >= 12) {
            $recommendations[] = [
                'action' => 'reduce_heating',
                'priority' => 'medium',
                'reason' => "Température extérieure modérée ({$temp}°C)",
                'suggestion' => "Réduire le chauffage de 1°C",
            ];
        }

        // ☀️ Ressenti > température réelle (ensoleillement)
        if ($feelsLike > $temp + 2) {
            $recommendations[] = [
                'action' => 'reduce_heating',
                'priority' => 'medium',
                'reason' => "Ensoleillement important (ressenti {$feelsLike}°C)",
                'suggestion' => "Profiter de l'apport solaire gratuit",
            ];
        }

        return [
            'should_reduce' => count($recommendations) > 0,
            'recommendations' => $recommendations,
            'weather' => $weather['current'],
        ];
    }

    /**
     * Obtient la description météo selon le code WMO
     */
    public function getWeatherDescription(int $code): string
    {
        return match ($code) {
            0 => 'Ciel dégagé',
            1, 2, 3 => 'Partiellement nuageux',
            45, 48 => 'Brouillard',
            51, 53, 55 => 'Bruine',
            61, 63, 65 => 'Pluie',
            71, 73, 75 => 'Neige',
            80, 81, 82 => 'Averses',
            95, 96, 99 => 'Orage',
            default => 'Indéterminé',
        };
    }
}
