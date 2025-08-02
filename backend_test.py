#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Todo List Application
Tests all CRUD operations and error handling scenarios
"""

import requests
import json
import sys
from datetime import datetime
import uuid

# Backend URL from environment
BACKEND_URL = "https://95121f26-2e57-4a80-9d21-f4fe1dd6b0f1.preview.emergentagent.com/api"

class TodoAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.created_todos = []  # Track created todos for cleanup
        
    def log_test(self, test_name, success, details=""):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        print()
        
    def test_health_check(self):
        """Test the root endpoint to ensure API is running"""
        print("=== Testing Health Check ===")
        try:
            response = self.session.get(f"{self.base_url}/")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Todo API is running":
                    self.log_test("Health Check", True, f"API is running - Response: {data}")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_create_todo(self):
        """Test creating new todos with different titles"""
        print("=== Testing Create Todo ===")
        test_cases = [
            "Complete project documentation",
            "Review code changes",
            "Schedule team meeting",
            "Update database schema"
        ]
        
        success_count = 0
        for title in test_cases:
            try:
                payload = {"title": title}
                response = self.session.post(f"{self.base_url}/todos", json=payload)
                
                if response.status_code == 200:
                    data = response.json()
                    # Validate response structure
                    required_fields = ["id", "title", "status", "created_at", "updated_at"]
                    if all(field in data for field in required_fields):
                        if data["title"] == title and data["status"] == "to do":
                            self.created_todos.append(data["id"])
                            self.log_test(f"Create Todo: '{title}'", True, f"ID: {data['id']}, Status: {data['status']}")
                            success_count += 1
                        else:
                            self.log_test(f"Create Todo: '{title}'", False, f"Invalid data: {data}")
                    else:
                        self.log_test(f"Create Todo: '{title}'", False, f"Missing fields in response: {data}")
                else:
                    self.log_test(f"Create Todo: '{title}'", False, f"Status: {response.status_code}, Response: {response.text}")
                    
            except Exception as e:
                self.log_test(f"Create Todo: '{title}'", False, f"Error: {str(e)}")
        
        return success_count == len(test_cases)
    
    def test_get_todos(self):
        """Test fetching all todos and verify order (newest first)"""
        print("=== Testing Get Todos ===")
        try:
            response = self.session.get(f"{self.base_url}/todos")
            
            if response.status_code == 200:
                todos = response.json()
                
                if isinstance(todos, list):
                    self.log_test("Get Todos - Response Type", True, f"Retrieved {len(todos)} todos")
                    
                    # Check if todos are ordered by created_at (newest first)
                    if len(todos) > 1:
                        dates = [todo.get("created_at") for todo in todos if "created_at" in todo]
                        if len(dates) == len(todos):
                            # Convert to datetime objects for comparison
                            datetime_objects = []
                            for date_str in dates:
                                try:
                                    dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                                    datetime_objects.append(dt)
                                except:
                                    # Try alternative parsing
                                    dt = datetime.fromisoformat(date_str.split('.')[0])
                                    datetime_objects.append(dt)
                            
                            is_sorted = all(datetime_objects[i] >= datetime_objects[i+1] for i in range(len(datetime_objects)-1))
                            self.log_test("Get Todos - Order Check", is_sorted, 
                                        f"Todos {'are' if is_sorted else 'are NOT'} sorted by newest first")
                        else:
                            self.log_test("Get Todos - Order Check", False, "Some todos missing created_at field")
                    else:
                        self.log_test("Get Todos - Order Check", True, "Not enough todos to verify ordering")
                    
                    # Validate structure of each todo
                    structure_valid = True
                    for todo in todos:
                        required_fields = ["id", "title", "status", "created_at", "updated_at"]
                        if not all(field in todo for field in required_fields):
                            structure_valid = False
                            break
                    
                    self.log_test("Get Todos - Structure Validation", structure_valid, 
                                "All todos have required fields" if structure_valid else "Some todos missing required fields")
                    
                    return len(todos) >= 0 and structure_valid
                else:
                    self.log_test("Get Todos", False, f"Response is not a list: {todos}")
                    return False
            else:
                self.log_test("Get Todos", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Get Todos", False, f"Error: {str(e)}")
            return False
    
    def test_update_todo_status(self):
        """Test toggling status from 'to do' to 'finished' and vice versa"""
        print("=== Testing Update Todo Status ===")
        
        if not self.created_todos:
            self.log_test("Update Todo Status", False, "No todos available for testing")
            return False
        
        # Test updating first created todo
        todo_id = self.created_todos[0]
        success_count = 0
        
        # Test 1: Change status to "finished"
        try:
            payload = {"status": "finished"}
            response = self.session.put(f"{self.base_url}/todos/{todo_id}", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "finished" and data.get("id") == todo_id:
                    self.log_test("Update Status to 'finished'", True, f"Status updated successfully")
                    success_count += 1
                else:
                    self.log_test("Update Status to 'finished'", False, f"Status not updated correctly: {data}")
            else:
                self.log_test("Update Status to 'finished'", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Update Status to 'finished'", False, f"Error: {str(e)}")
        
        # Test 2: Change status back to "to do"
        try:
            payload = {"status": "to do"}
            response = self.session.put(f"{self.base_url}/todos/{todo_id}", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "to do" and data.get("id") == todo_id:
                    self.log_test("Update Status to 'to do'", True, f"Status reverted successfully")
                    success_count += 1
                else:
                    self.log_test("Update Status to 'to do'", False, f"Status not updated correctly: {data}")
            else:
                self.log_test("Update Status to 'to do'", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Update Status to 'to do'", False, f"Error: {str(e)}")
        
        # Test 3: Update title as well
        try:
            payload = {"title": "Updated task title", "status": "finished"}
            response = self.session.put(f"{self.base_url}/todos/{todo_id}", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("title") == "Updated task title" and data.get("status") == "finished":
                    self.log_test("Update Title and Status", True, f"Both fields updated successfully")
                    success_count += 1
                else:
                    self.log_test("Update Title and Status", False, f"Fields not updated correctly: {data}")
            else:
                self.log_test("Update Title and Status", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_test("Update Title and Status", False, f"Error: {str(e)}")
        
        return success_count == 3
    
    def test_delete_todo(self):
        """Test deleting todos and verify they're removed"""
        print("=== Testing Delete Todo ===")
        
        if not self.created_todos:
            self.log_test("Delete Todo", False, "No todos available for testing")
            return False
        
        # Test deleting the last created todo
        todo_id = self.created_todos[-1]
        
        try:
            response = self.session.delete(f"{self.base_url}/todos/{todo_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Todo deleted successfully":
                    self.log_test("Delete Todo", True, f"Todo {todo_id} deleted successfully")
                    
                    # Verify todo is actually removed by trying to get all todos
                    get_response = self.session.get(f"{self.base_url}/todos")
                    if get_response.status_code == 200:
                        todos = get_response.json()
                        todo_exists = any(todo.get("id") == todo_id for todo in todos)
                        if not todo_exists:
                            self.log_test("Delete Verification", True, "Todo successfully removed from database")
                            self.created_todos.remove(todo_id)
                            return True
                        else:
                            self.log_test("Delete Verification", False, "Todo still exists in database")
                            return False
                    else:
                        self.log_test("Delete Verification", False, "Could not verify deletion")
                        return False
                else:
                    self.log_test("Delete Todo", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Delete Todo", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Delete Todo", False, f"Error: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test with invalid todo IDs for update/delete operations"""
        print("=== Testing Error Handling ===")
        
        invalid_ids = [
            "invalid-uuid",
            "12345",
            str(uuid.uuid4()),  # Valid UUID format but non-existent
            "",
            "null"
        ]
        
        success_count = 0
        
        # Test invalid IDs for update operations
        for invalid_id in invalid_ids:
            try:
                payload = {"status": "finished"}
                response = self.session.put(f"{self.base_url}/todos/{invalid_id}", json=payload)
                
                if response.status_code == 404:
                    data = response.json()
                    if "not found" in data.get("detail", "").lower():
                        self.log_test(f"Update Invalid ID '{invalid_id}'", True, "Correctly returned 404")
                        success_count += 1
                    else:
                        self.log_test(f"Update Invalid ID '{invalid_id}'", False, f"Wrong error message: {data}")
                else:
                    self.log_test(f"Update Invalid ID '{invalid_id}'", False, f"Expected 404, got {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Update Invalid ID '{invalid_id}'", False, f"Error: {str(e)}")
        
        # Test invalid IDs for delete operations
        for invalid_id in invalid_ids:
            try:
                response = self.session.delete(f"{self.base_url}/todos/{invalid_id}")
                
                if response.status_code == 404:
                    data = response.json()
                    if "not found" in data.get("detail", "").lower():
                        self.log_test(f"Delete Invalid ID '{invalid_id}'", True, "Correctly returned 404")
                        success_count += 1
                    else:
                        self.log_test(f"Delete Invalid ID '{invalid_id}'", False, f"Wrong error message: {data}")
                else:
                    self.log_test(f"Delete Invalid ID '{invalid_id}'", False, f"Expected 404, got {response.status_code}")
                    
            except Exception as e:
                self.log_test(f"Delete Invalid ID '{invalid_id}'", False, f"Error: {str(e)}")
        
        return success_count == len(invalid_ids) * 2
    
    def cleanup(self):
        """Clean up any remaining test todos"""
        print("=== Cleanup ===")
        for todo_id in self.created_todos[:]:
            try:
                response = self.session.delete(f"{self.base_url}/todos/{todo_id}")
                if response.status_code == 200:
                    print(f"✅ Cleaned up todo: {todo_id}")
                    self.created_todos.remove(todo_id)
                else:
                    print(f"⚠️  Could not clean up todo: {todo_id}")
            except Exception as e:
                print(f"⚠️  Error cleaning up todo {todo_id}: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Comprehensive Todo API Testing")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        results = {}
        
        # Run tests in order
        results["health_check"] = self.test_health_check()
        results["create_todo"] = self.test_create_todo()
        results["get_todos"] = self.test_get_todos()
        results["update_todo_status"] = self.test_update_todo_status()
        results["delete_todo"] = self.test_delete_todo()
        results["error_handling"] = self.test_error_handling()
        
        # Cleanup
        self.cleanup()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name.replace('_', ' ').title()}")
        
        print(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Todo API is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Please check the details above.")
            return False

if __name__ == "__main__":
    tester = TodoAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)