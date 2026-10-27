def test_capture_and_list_idea(client, auth_headers):
    # Capture raw idea
    thought = "A zero-latency voice recorder that automatically clusters thoughts by emotional cadence."
    payload = {
        "raw_thought": thought,
        "importance": 4
    }
    create_res = client.post("/api/v1/ideas", json=payload, headers=auth_headers)
    assert create_res.status_code == 201
    idea = create_res.json()
    assert idea["raw_thought"] == thought
    assert idea["status"] == "SPARK"
    assert idea["importance"] == 4
    assert idea["title"] != "" # Heuristic title generated

    # List ideas
    list_res = client.get("/api/v1/ideas", headers=auth_headers)
    assert list_res.status_code == 200
    ideas = list_res.json()
    assert any(i["id"] == idea["id"] for i in ideas)

def test_update_idea_and_coords(client, auth_headers):
    create_res = client.post("/api/v1/ideas", json={"raw_thought": "Quantum simulation in the browser"}, headers=auth_headers)
    idea_id = create_res.json()["id"]

    # Update title and coordinates
    update_res = client.patch(
        f"/api/v1/ideas/{idea_id}",
        json={
            "title": "Browser Quantum Sandbox",
            "canvas_x": 120.5,
            "canvas_y": -85.2,
            "status": "EXPLORING"
        },
        headers=auth_headers
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["title"] == "Browser Quantum Sandbox"
    assert updated["canvas_x"] == 120.5
    assert updated["canvas_y"] == -85.2
    assert updated["status"] == "EXPLORING"

def test_archive_and_delete_idea(client, auth_headers):
    create_res = client.post("/api/v1/ideas", json={"raw_thought": "Temporary test idea"}, headers=auth_headers)
    idea_id = create_res.json()["id"]

    # Soft archive
    del_res = client.delete(f"/api/v1/ideas/{idea_id}?permanent=false", headers=auth_headers)
    assert del_res.status_code == 204

    # Default list excludes archived
    list_res = client.get("/api/v1/ideas", headers=auth_headers)
    assert not any(i["id"] == idea_id for i in list_res.json())

    # Include archived returns it
    archived_res = client.get("/api/v1/ideas?include_archived=true", headers=auth_headers)
    assert any(i["id"] == idea_id for i in archived_res.json())
