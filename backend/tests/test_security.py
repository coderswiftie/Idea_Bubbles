def test_user_data_isolation(client, auth_headers, second_user_headers):
    # User 1 creates an idea
    idea1 = client.post(
        "/api/v1/ideas",
        json={"raw_thought": "Confidential startup idea for User 1 only"},
        headers=auth_headers
    ).json()
    idea1_id = idea1["id"]

    # User 2 attempts to get User 1's idea -> must be 404 (preventing ID enumeration)
    get_res = client.get(f"/api/v1/ideas/{idea1_id}", headers=second_user_headers)
    assert get_res.status_code == 404

    # User 2 attempts to update User 1's idea -> must be 404
    patch_res = client.patch(
        f"/api/v1/ideas/{idea1_id}",
        json={"title": "Hacked Title"},
        headers=second_user_headers
    )
    assert patch_res.status_code == 404

    # User 2 attempts to delete User 1's idea -> must be 404
    del_res = client.delete(f"/api/v1/ideas/{idea1_id}", headers=second_user_headers)
    assert del_res.status_code == 404

    # Verify User 1's idea remains intact
    verify_res = client.get(f"/api/v1/ideas/{idea1_id}", headers=auth_headers)
    assert verify_res.status_code == 200
    assert verify_res.json()["title"] != "Hacked Title"
