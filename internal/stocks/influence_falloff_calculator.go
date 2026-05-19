package stocks

// GetLinearFalloffInfluenceFactor definition of progressPotential: [0; 100]
// Returns actual current influence per mille
func GetLinearFalloffInfluenceFactor(permille float32, progressPercentage float64) float64 {
	if progressPercentage < 0 || progressPercentage > 100 {
		return 0
	}
	effectivenessPercentage := 100 - progressPercentage
	return (effectivenessPercentage * float64(permille)) / 100
}

func GetNoneFalloffInfluenceFactor(permille float32, progressPercentage float64) float64 {
	if progressPercentage < 0 || progressPercentage > 100 {
		return 0
	}
	return float64(permille)
}

func GetDelayedLinearFalloffInfluenceFactor(permille float32, progressPercentage float64) float64 {
	if progressPercentage < 0 || progressPercentage > 100 {
		return 0
	}
	if progressPercentage < 50 {
		return float64(permille)
	}
	effectivenessPercentage := 200 - 2*progressPercentage
	return (effectivenessPercentage * float64(permille)) / 100
}
