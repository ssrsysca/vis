package main

import (
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"math/cmplx"
	"math/rand"
	"os"
	"strconv"
	"time"
)

// Node ... node in graph
type Node struct {
	pos      complex128
	disp     complex128
	id       int
	nodeType int
	degree   int
	label    string
}

//Edge ... edge in graph
type Edge struct {
	source   *Node
	dest     *Node
	id       int
	protocol int
	time     int64
}

func dataprocess(finpath string, WIDTH int, HEIGHT int) (Nodes []*Node, Edges []*Edge) {
	SENDER := 1
	RECEIVER := 2
	BOTH := 3

	fin, err := os.Open(finpath)
	if err != nil {
		log.Fatalln(err.Error)
	}
	defer fin.Close()

	reader := csv.NewReader(fin)

	Edges = []*Edge{}
	sIPIDMap := make(map[string]int)
	dIPIDMap := make(map[string]int)
	Nodes = []*Node{}
	ID := -1
	IDposmap := make(map[int]complex128)

	if fintemp, err := os.OpenFile("temp.csv", os.O_RDONLY|os.O_CREATE, 0666); err != nil {
		fmt.Println("exit here -------------------------------open temp.csv")
		//log.Fatalln(err.Error)
	} else {
		defer fintemp.Close()
		tmpreader := csv.NewReader(fintemp)
		for {
			tmpData, err := tmpreader.Read()
			if err == io.EOF {
				break
			} else if err != nil {
				log.Fatalln(err.Error)
			}
			id, _ := strconv.Atoi(tmpData[0])
			x, _ := strconv.ParseFloat(tmpData[1], 64)
			y, _ := strconv.ParseFloat(tmpData[2], 64)
			IDposmap[id] = complex(x, y)
		}
	}

	rander := rand.New(rand.NewSource(time.Now().UnixNano()))

	//leave out title
	if _, err := reader.Read(); err != nil {
		log.Fatalln(err.Error)
	}

	for {
		rawData, err := reader.Read()
		if err == io.EOF {
			break
		} else if err != nil {
			log.Fatalln(err.Error)
		}

		if sIPIDMap[rawData[1]] == 0 {

			if dIPIDMap[rawData[1]] == 0 {

				//ip appere first time
				ID++
				Nodes = append(Nodes, &Node{
					pos: complex(rander.Float64()*float64(WIDTH/2)-float64(WIDTH/4),
						rander.Float64()*float64(HEIGHT/2)-float64(HEIGHT/4)),
					disp:     0,
					id:       ID,
					degree:   0,
					nodeType: SENDER,
					label:    rawData[1],
				})
				if IDposmap[ID] != complex(0, 0) {
					Nodes[ID].pos = IDposmap[ID]
				}
				sIPIDMap[rawData[1]] = ID
			} else {

				// sip appered in dip list
				sIPIDMap[rawData[1]] = dIPIDMap[rawData[1]]
				Nodes[dIPIDMap[rawData[1]]].nodeType = BOTH
			}
		}

		if dIPIDMap[rawData[2]] == 0 {

			if sIPIDMap[rawData[2]] == 0 {

				//ip appere first time
				ID++
				Nodes = append(Nodes, &Node{
					pos: complex(rander.Float64()*float64(WIDTH/2)-float64(WIDTH/4),
						rander.Float64()*float64(HEIGHT/2)-float64(HEIGHT/4)),
					disp:     0,
					id:       ID,
					nodeType: RECEIVER,
					degree:   0,
					label:    rawData[2],
				})
				if IDposmap[ID] != complex(0, 0) {
					Nodes[ID].pos = IDposmap[ID]
				}
				dIPIDMap[rawData[2]] = ID
			} else {

				//dip appered in sip list
				dIPIDMap[rawData[2]] = sIPIDMap[rawData[2]]
				Nodes[dIPIDMap[rawData[2]]].nodeType = BOTH
			}
		}

		newEdge := &Edge{
			source: Nodes[sIPIDMap[rawData[1]]],
			dest:   Nodes[dIPIDMap[rawData[2]]],
		}

		if id, err := strconv.Atoi(rawData[0]); err != nil {
			log.Fatalln(err.Error)
		} else {
			newEdge.id = id
		}

		if prtcl, err := strconv.Atoi(rawData[5]); err != nil {
			log.Fatalln(err.Error)
		} else {
			newEdge.protocol = prtcl
		}

		if time, err := strconv.Atoi(rawData[6]); err != nil {
			log.Fatalln(err.Error)
		} else {
			newEdge.time = int64(time)
		}

		Edges = append(Edges, newEdge)

	}

	for _, edge := range Edges {
		edge.source.degree++
		edge.dest.degree++
	}

	for _, node := range Nodes {
		if cmplx.IsNaN(node.pos) {
			fmt.Printf("%+v \n", *node)
		}
	}
	return
}
