package main

import (
	"math"
	"math/cmplx"
)

//Change the pos of Node
func draw(Nodes []*Node, Edges []*Edge, width int, height int) {

	k := math.Sqrt(float64(width * height / len(Nodes)))
	temperature := float64(width / 2)

	//maxd, mind := CalDegree(Nodes)

	for {
		if temperature < 100 {
			break
		}
		for _, node := range Nodes {
			node.disp = complex(0, 0)
		}

		//calculate repulsive force
		for _, node := range Nodes {

			for _, node2 := range Nodes {
				if node != node2 {
					delta := node.pos - node2.pos
					if delta != complex(0, 0) {
						node.disp += delta * complex(
							0.1*k*k/(cmplx.Abs(delta)*cmplx.Abs(delta)), 0)
					}
				}
			}

		}

		//calculate attractive force
		for _, edge := range Edges {
			delta := edge.source.pos - edge.dest.pos
			change := complex(0.1*cmplx.Abs(delta)/k, 0)
			edge.source.disp -= delta * change
			edge.dest.disp += delta * change

		}

		//limit max displacement
		for _, node := range Nodes {
			node.pos += node.disp * complex(
				math.Min(
					cmplx.Abs(node.disp),
					temperature)/cmplx.Abs(node.disp), 0)
			/*hw := float64(width / 2)
			//hh := float64(height / 2)
			if cmplx.Abs(node.pos) > hw {
				node.pos *= complex(hw/cmplx.Abs(node.pos), 0)
			}*/

			//node.pos *= complex((1.0 - 0.2*float64((node.degree-mind)/(maxd-mind))), 0)
			/*
				node.pos = complex(
					math.Min(hw, math.Max(-hw, real(node.pos))),
					math.Min(hh, math.Max(-hh, imag(node.pos))))*/
		}
		//Nodes[maxid].pos = complex(0.1, 0.1)
		temperature *= 0.8 //cool(temperature)
	}

}

func CalDegree(Nodes []*Node) (int, int) {
	min := int(math.MaxInt32)
	max := 0
	for _, node := range Nodes {
		if node.degree > max {
			max = node.degree
		}
		if node.degree < min {
			min = node.degree
		}
	}
	return max, min
}
