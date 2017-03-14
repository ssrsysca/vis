package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"fmt"

	"gitlab.1dmy.com/ezbuy/base/dist/mservice"
)

type Service struct {
	mservice.Server
}

var finpath string = "./data/data.csv"
var foutpath string = "testout.json"
var WIDTH int = 2000
var HEIGHT int = WIDTH

func main() {

	//Nodes, Edges := dataprocess(finpath, WIDTH, HEIGHT)

	//FR layout
	//draw(Nodes, Edges, WIDTH, HEIGHT)

	//YFH layout
	//drawyfh(Nodes, Edges, WIDTH, HEIGHT)

	//jsonoutput(Nodes, Edges, foutpath)
	//lastbuild(Nodes)
	//csvoutput(Nodes, foutpath)

	//server
	http.HandleFunc("/draw", drawHandle)
	http.HandleFunc("/localdraw", localDraw)
	http.Handle("/", http.FileServer(http.Dir(".")))
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalln(err.Error)
	}
	//http.ListenAndServe(":8081", nil)

}

func drawHandle(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("content-type", "application/json")
	Nodes, Edges := dataprocess(finpath, WIDTH, HEIGHT)

	//FR layout
	draw(Nodes, Edges, WIDTH, HEIGHT)

	//YFH layout
	//drawyfh(Nodes, Edges, WIDTH, HEIGHT)

	nodes := []*jNode{}
	for _, node := range Nodes {
		nodes = append(nodes, &jNode{
			Label: node.label,
			X:     real(node.pos),
			Y:     imag(node.pos),
			ID:    strconv.Itoa(node.id),
			Attributes: Attr{
				Type2: strconv.Itoa(node.nodeType - 1),
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
		fmt.Println("-----------------------------------------------Marshal failed")
		log.Fatalln(err.Error)
	}

	w.Write(body)

	lastbuild(Nodes)

}

/*
func (s *Service) GetData(ctx context.T, req *gRpc.GetFRDrawReq) (*gRpc.GetFRDrawResp, error) {
	nodes, edges := dataprocess(finpath, WIDTH, HEIGHT)
	jnodes := []*gRpc.Node{}
	for _, node := range nodes {
		jnodes = append(jnodes, &gRpc.Node{
			Label: node.label,
			X:     fmt.Sprintf("%v", real(node.pos)),
			Y:     fmt.Sprintf("%v", imag(node.pos)),
			Id:    strconv.Itoa(node.id),
			Attributes: &gRpc.Attr{
				Type2: strconv.Itoa(node.nodeType - 1),
			},
			Color: getColor(node.nodeType),
			Size:  fmt.Sprintf("%v", getSize(node.degree, nodes)),
		})
	}

	jedges := []*gRpc.Edge{}
	for _, edge := range edges {
		jedges = append(jedges, &gRpc.Edge{
			Source: strconv.Itoa(edge.source.id),
			Dest:   strconv.Itoa(edge.dest.id),
			Id:     strconv.Itoa(edge.id),
			Color:  "rbg(0,0,0)",
		})
	}

	return &gRpc.GetFRDrawResp{
		Result: &gRpc.Result{
			Code:    1,
			Message: "ok",
		},
		Nodes: jnodes,
		Edges: jedges,
	}, nil

}*/
