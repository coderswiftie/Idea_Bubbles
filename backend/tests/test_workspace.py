def test_workspace_notes_flow(client, auth_headers):
    # Create idea
    idea_res = client.post("/api/v1/ideas", json={"raw_thought": "Build an open-source ambient sound generator"}, headers=auth_headers)
    idea_id = idea_res.json()["id"]

    # Add Note
    note_payload = {"content": "Explored Web Audio API nodes: OscillatorNode and BiquadFilterNode."}
    note_res = client.post(f"/api/v1/ideas/{idea_id}/notes", json=note_payload, headers=auth_headers)
    assert note_res.status_code == 201
    note = note_res.json()
    assert note["content"] == note_payload["content"]

    # Update Note
    patch_res = client.patch(f"/api/v1/ideas/{idea_id}/notes/{note['id']}", json={"content": "Updated note content with Pink Noise."}, headers=auth_headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["content"] == "Updated note content with Pink Noise."

    # Verify present in idea detail
    detail_res = client.get(f"/api/v1/ideas/{idea_id}", headers=auth_headers)
    assert len(detail_res.json()["notes"]) == 1

def test_workspace_tasks_flow(client, auth_headers):
    idea_res = client.post("/api/v1/ideas", json={"raw_thought": "Minimalist habit tracker with zero metrics"}, headers=auth_headers)
    idea_id = idea_res.json()["id"]

    # Add Task
    task_res = client.post(f"/api/v1/ideas/{idea_id}/tasks", json={"title": "Design simple 1-button UI"}, headers=auth_headers)
    assert task_res.status_code == 201
    task = task_res.json()
    assert task["is_completed"] is False

    # Mark completed
    toggle_res = client.patch(f"/api/v1/ideas/{idea_id}/tasks/{task['id']}", json={"is_completed": True}, headers=auth_headers)
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_completed"] is True
