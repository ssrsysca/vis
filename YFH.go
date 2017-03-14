package main

import (
	"math"
	"math/cmplx"
)

func drawyfh(Nodes []*Node, Edges []*Edge, width int, height int) {
	k := math.Sqrt(float64(width * height / len(Nodes)))
	step := float64(width / 2)
	Energy := math.MaxFloat64

	for {
		if step < 1 {
			break
		}

		lastEn := Energy
		Energy = 0
		for _, node := range Nodes {
			node.disp = complex(0, 0)
			for _, edge := range Edges {

				if edge.source.id == node.id || edge.dest.id == node.id {
					delta := edge.source.pos - edge.dest.pos
					change := complex(cmplx.Abs(delta)/k, 0)
					node.disp -= delta * change
				}
			}

			for _, node2 := range Nodes {
				if node != node2 {
					delta := node.pos - node2.pos
					if delta != complex(0, 0) {
						node.disp += delta * complex(
							k*k/(cmplx.Abs(delta)*cmplx.Abs(delta)), 0)
					}
				}
			}

			node.pos += node.disp * complex(step/cmplx.Abs(node.disp), 0)
			Energy += cmplx.Abs(node.disp) * cmplx.Abs(node.disp)
		}

		step = updateStep(step, Energy, lastEn)

	}
}

var progress int = 0

func updateStep(step float64, Energy float64, lastEn float64) float64 {
	if Energy < lastEn {
		progress++
		if progress > 4 {
			progress = 0
			step /= 0.9
		}
	} else {
		progress = 0
		step *= 0.9
	}
	return step
}
