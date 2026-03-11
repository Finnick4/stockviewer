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
