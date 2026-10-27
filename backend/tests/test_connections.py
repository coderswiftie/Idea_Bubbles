def test_idea_connections(client, auth_headers):
    # Create two ideas
    idea1 = client.post("/api/v1/ideas", json={"raw_thought": "Interactive fluid simulation on canvas"}, headers=auth_headers).json()
    idea2 = client.post("/api/v1/ideas", json={"raw_thought": "Procedural music generation inspired by weather"}, headers=auth_headers).json()

    # Connect them
    conn_payload = {
        "target_idea_id": idea2["id"],
        "relationship_type": "synergy",
        "description": "Fluid visuals can be driven by procedural audio frequencies."
    }
    conn_res = client.post(f"/api/v1/connections/{idea1['id']}", json=conn_payload, headers=auth_headers)
    assert conn_res.status_code == 201
    conn = conn_res.json()
    assert conn["source_idea_id"] == idea1["id"]
    assert conn["target_idea_id"] == idea2["id"]

    # List all connections
    list_res = client.get("/api/v1/connections", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1
