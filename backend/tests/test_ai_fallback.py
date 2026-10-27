def test_ai_status_endpoint(client):
    res = client.get("/api/v1/ai/status")
    assert res.status_code == 200
    data = res.json()
    assert "configured" in data
    assert "provider" in data

def test_ai_summarize_and_expand_fallback(client, auth_headers):
    # Create idea
    idea = client.post("/api/v1/ideas", json={"raw_thought": "An AI terrarium that grows virtual plants as you write code."}, headers=auth_headers).json()
    idea_id = idea["id"]

    # Test Summarize
    sum_res = client.post(f"/api/v1/ideas/{idea_id}/ai/summarize", headers=auth_headers)
    assert sum_res.status_code == 200
    sum_data = sum_res.json()
    assert "one_sentence_summary" in sum_data
    assert len(sum_data["key_themes"]) > 0
    assert len(sum_data["unresolved_questions"]) > 0

    # Test Expand
    exp_res = client.post(f"/api/v1/ideas/{idea_id}/ai/expand", headers=auth_headers)
    assert exp_res.status_code == 200
    exp_data = exp_res.json()
    assert len(exp_data["possible_directions"]) > 0
    assert len(exp_data["assumptions"]) > 0
    assert "realistic_next_step" in exp_data

def test_ai_chat_with_idea(client, auth_headers):
    idea = client.post("/api/v1/ideas", json={"raw_thought": "Solar-powered e-ink weather station for balcony"}, headers=auth_headers).json()
    idea_id = idea["id"]

    # Chat with idea
    chat_res = client.post(
        f"/api/v1/ideas/{idea_id}/ai/chat",
        json={"message": "How do I start building this hardware project?"},
        headers=auth_headers
    )
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert chat_data["role"] == "assistant"
    assert len(chat_data["content"]) > 10
