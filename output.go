package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/cmplx"
	"os"
	"strconv"
)

type jNode struct {
	Label      string  `json:"label"`
	X          float64 `json:"x"`
	Y          float64 `json:"y"`
	ID         string  `json:"id"`
	Attributes Attr    `json:"attributes"`
	Color      string  `json:"color"`
	Size       float64 `json:"size"`
}

type Attr struct {
	Type2 string `json:"type2"`
}

type jEdge struct {
	Source string `json:"source"`
	Dest   string `json:"target"`
	ID     string `json:"id"`
	Color  string `json:"color"`
}

type jstruct struct {
	Nodes []*jNode `json:"nodes"`
	Edges []*jEdge `json:"edges"`
}

func jsonoutput(Nodes []*Node, Edges []*Edge, foutpath string) {

	nodes := []*jNode{}
	for _, node := range Nodes {
		nodes = append(nodes, &jNode{
			Label: node.label,
			X:     real(node.pos),
			Y:     imag(node.pos),
			ID:    strconv.Itoa(node.id),
			Attributes: Attr{
				Type2: strconv.Itoa(node.nodeType - 1), //这里会不会有bug
			},
			Color: getColor(node.nodeType),
			Size:  getSize(node.degree, Nodes),
		})
	}

	edges := []*jEdge{}
	for _, edge := range Edges {
		edges = append(edges, &jEdge{
			Source: strconv.Itoa(edge.source.id),
			Dest:   strconv.Itoa(edge.dest.id),
			Color:  "rgb(0,0,0)",
			ID:     strconv.Itoa(edge.id),
		})
	}

	output := &jstruct{
		Nodes: nodes,
		Edges: edges,
	}

	body, err := json.Marshal(output)
	if err != nil {
		log.Fatalln(err.Error)
	}
	os.Remove(foutpath)
	if fout, err := os.OpenFile(foutpath,
		os.O_RDWR|os.O_CREATE, 0666); err != nil {
		log.Fatalln(err.Error)
	} else {
		defer fout.Close()
		fout.Write(body)
	}
}

func getColor(ntype int) string {

	switch ntype {
	case 1:
		return "#DDA59E"
	case 2:
		return "#7FCDDD"
	case 3:
		return "#C2DD86"

	}
	return "rgb(0,0,0)"
}

func getSize(degree int, Nodes []*Node) float64 {
	max := degree
	for _, node := range Nodes {
		if node.degree > max {
			max = node.degree
		}
	}
	return float64(39*degree/max + 6)
}

func csvoutput(Nodes []*Node, foutpath string) {
	if fout, err := os.OpenFile(foutpath,
		os.O_RDWR|os.O_APPEND|os.O_CREATE, 0666); err != nil {
		log.Fatalln(err.Error)
	} else {
		defer fout.Close()
		fout.WriteString("NodeID,x,y,nodeType,degree,label\n")
		for _, node := range Nodes {
			fout.WriteString(fmt.Sprintf("%v,%v,%v,%v,%v,%v\n",
				node.id, real(node.pos), imag(node.pos), node.nodeType, node.degree, node.label))
		}
	}
}

func lastbuild(Nodes []*Node) {
	os.Remove("temp.csv")
	if fout, err := os.OpenFile("temp.csv", os.O_RDWR|os.O_APPEND|os.O_CREATE, 0666); err != nil {
		log.Fatalln(err.Error)
	} else {
		defer fout.Close()
		maxd, mind := CalDegree(Nodes)
		star := complex(0, 0)
		count := 0
		hw := float64(WIDTH / 2)
		//rander := rand.New(rand.NewSource(time.Now().UnixNano()))

		for _, node := range Nodes {
			if node.degree > (maxd+mind)/5 {
				star += node.pos
				count++
			}
		}

		star /= complex(float64(count), 0)
		for _, node := range Nodes {
			node.pos -= star
			if cmplx.Abs(node.pos) > hw {
				node.pos *= complex(hw/cmplx.Abs(node.pos), 0)
			}
		}
		/*
			for _, node := range Nodes {
				if math.Abs(cmplx.Abs(node.pos)-hw) < 1 {
					node.pos = node.pos - node.pos*complex(rander.Float64()*10/cmplx.Abs(node.pos), 0)
				}
			}*/

		for _, node := range Nodes {
			fout.WriteString(fmt.Sprintf("%v,%v,%v\n", node.id, real(node.pos), imag(node.pos)))
		}
	}
}
