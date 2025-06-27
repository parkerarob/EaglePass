#!/bin/bash

# EaglePass Task Manager
# A simple shell script to manage tasks in the tasks.json file

TASKS_FILE=".cursor/tasks/tasks.json"
TEMP_FILE="tmp_tasks.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if jq is installed
check_jq() {
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}Error: jq is required but not installed.${NC}"
        echo "Install with: brew install jq (macOS) or apt-get install jq (Ubuntu)"
        exit 1
    fi
}

# Check if tasks file exists
check_tasks_file() {
    if [ ! -f "$TASKS_FILE" ]; then
        echo -e "${RED}Error: Tasks file not found at $TASKS_FILE${NC}"
        exit 1
    fi
}

# Show help
show_help() {
    echo -e "${BLUE}EaglePass Task Manager${NC}"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo -e "  ${GREEN}list${NC}           List all tasks"
    echo -e "  ${GREEN}list-pending${NC}   List pending tasks"
    echo -e "  ${GREEN}list-high${NC}      List high priority tasks"
    echo -e "  ${GREEN}next${NC}           Show next available task"
    echo -e "  ${GREEN}show <id>${NC}      Show specific task details"
    echo -e "  ${GREEN}start <id>${NC}     Mark task as in-progress"
    echo -e "  ${GREEN}complete <id>${NC}  Mark task as completed"
    echo -e "  ${GREEN}block <id>${NC}     Mark task as blocked"
    echo -e "  ${GREEN}status${NC}         Show project status summary"
    echo -e "  ${GREEN}dependencies <id>${NC} Show task dependencies"
    echo ""
    echo "Examples:"
    echo "  $0 list"
    echo "  $0 show 2"
    echo "  $0 start 2"
    echo "  $0 complete 1"
}

# List all tasks
list_tasks() {
    echo -e "${BLUE}📋 All Tasks${NC}"
    echo ""
    jq -r '.tags.master.tasks[] | 
        "\(.id): \(.title) 
         Status: \(.status) | Priority: \(.priority)
         Dependencies: \(.dependencies | join(", ") // "None")
         "' "$TASKS_FILE" | while IFS= read -r line; do
        if [[ $line == *"Status: completed"* ]]; then
            echo -e "${GREEN}✅ $line${NC}"
        elif [[ $line == *"Status: in-progress"* ]]; then
            echo -e "${YELLOW}🔄 $line${NC}"
        elif [[ $line == *"Status: blocked"* ]]; then
            echo -e "${RED}🚫 $line${NC}"
        elif [[ $line == *"Status: pending"* ]]; then
            echo -e "${CYAN}⏳ $line${NC}"
        else
            echo "$line"
        fi
    done
}

# List pending tasks
list_pending() {
    echo -e "${BLUE}📋 Pending Tasks${NC}"
    echo ""
    jq -r '.tags.master.tasks[] | select(.status == "pending") | 
        "\(.id): \(.title) (Priority: \(.priority))"' "$TASKS_FILE" | while IFS= read -r line; do
        echo -e "${CYAN}⏳ $line${NC}"
    done
}

# List high priority tasks
list_high() {
    echo -e "${BLUE}📋 High Priority Tasks${NC}"
    echo ""
    jq -r '.tags.master.tasks[] | select(.priority == "high") | 
        "\(.id): \(.title) (Status: \(.status))"' "$TASKS_FILE" | while IFS= read -r line; do
        if [[ $line == *"Status: completed"* ]]; then
            echo -e "${GREEN}✅ $line${NC}"
        elif [[ $line == *"Status: in-progress"* ]]; then
            echo -e "${YELLOW}🔄 $line${NC}"
        elif [[ $line == *"Status: blocked"* ]]; then
            echo -e "${RED}🚫 $line${NC}"
        else
            echo -e "${CYAN}⏳ $line${NC}"
        fi
    done
}

# Find next available task
next_task() {
    echo -e "${BLUE}🎯 Next Available Task${NC}"
    echo ""
    
    # Get all completed task IDs
    completed_tasks=$(jq -r '.tags.master.tasks[] | select(.status == "completed") | .id' "$TASKS_FILE")
    
    # Find the highest priority task with satisfied dependencies
    next=""
    
    # Check high priority tasks first
    while IFS= read -r task_line; do
        if [ -n "$task_line" ]; then
            task_id=$(echo "$task_line" | jq -r '.id')
            deps=$(echo "$task_line" | jq -r '.dependencies[]?' 2>/dev/null)
            
            # Check if all dependencies are satisfied
            deps_satisfied=true
            if [ -n "$deps" ]; then
                for dep in $deps; do
                    if ! echo "$completed_tasks" | grep -q "^$dep$"; then
                        deps_satisfied=false
                        break
                    fi
                done
            fi
            
            if [ "$deps_satisfied" = true ]; then
                next=$(echo "$task_line" | jq -r '"\(.id): \(.title) (Priority: \(.priority))"')
                break
            fi
        fi
    done < <(jq -c '.tags.master.tasks[] | select(.status == "pending") | select(.priority == "high")' "$TASKS_FILE")
    
    # If no high priority task found, check medium priority
    if [ -z "$next" ]; then
        while IFS= read -r task_line; do
            if [ -n "$task_line" ]; then
                task_id=$(echo "$task_line" | jq -r '.id')
                deps=$(echo "$task_line" | jq -r '.dependencies[]?' 2>/dev/null)
                
                # Check if all dependencies are satisfied
                deps_satisfied=true
                if [ -n "$deps" ]; then
                    for dep in $deps; do
                        if ! echo "$completed_tasks" | grep -q "^$dep$"; then
                            deps_satisfied=false
                            break
                        fi
                    done
                fi
                
                if [ "$deps_satisfied" = true ]; then
                    next=$(echo "$task_line" | jq -r '"\(.id): \(.title) (Priority: \(.priority))"')
                    break
                fi
            fi
        done < <(jq -c '.tags.master.tasks[] | select(.status == "pending") | select(.priority == "medium")' "$TASKS_FILE")
    fi
    
    # If still no task found, check low priority
    if [ -z "$next" ]; then
        while IFS= read -r task_line; do
            if [ -n "$task_line" ]; then
                task_id=$(echo "$task_line" | jq -r '.id')
                deps=$(echo "$task_line" | jq -r '.dependencies[]?' 2>/dev/null)
                
                # Check if all dependencies are satisfied
                deps_satisfied=true
                if [ -n "$deps" ]; then
                    for dep in $deps; do
                        if ! echo "$completed_tasks" | grep -q "^$dep$"; then
                            deps_satisfied=false
                            break
                        fi
                    done
                fi
                
                if [ "$deps_satisfied" = true ]; then
                    next=$(echo "$task_line" | jq -r '"\(.id): \(.title) (Priority: \(.priority))"')
                    break
                fi
            fi
        done < <(jq -c '.tags.master.tasks[] | select(.status == "pending") | select(.priority == "low")' "$TASKS_FILE")
    fi
    
    if [ -n "$next" ]; then
        echo -e "${GREEN}➡️  $next${NC}"
        echo ""
        # Show task details
        task_id=$(echo "$next" | cut -d: -f1)
        show_task "$task_id"
    else
        echo -e "${YELLOW}No available tasks found. All pending tasks may have unmet dependencies.${NC}"
    fi
}

# Show specific task
show_task() {
    local task_id="$1"
    if [ -z "$task_id" ]; then
        echo -e "${RED}Error: Task ID required${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📝 Task $task_id Details${NC}"
    echo ""
    
    task_info=$(jq -r --arg id "$task_id" '.tags.master.tasks[] | select(.id == $id) | 
        "Title: \(.title)
Description: \(.description)
Status: \(.status)
Priority: \(.priority)
Dependencies: \(.dependencies | join(", ") // "None")
Details: \(.details)
Test Strategy: \(.testStrategy)
Created: \(.created)
Updated: \(.updated)"' "$TASKS_FILE")
    
    if [ -n "$task_info" ]; then
        echo "$task_info"
    else
        echo -e "${RED}Task $task_id not found${NC}"
    fi
}

# Update task status
update_task_status() {
    local task_id="$1"
    local new_status="$2"
    
    if [ -z "$task_id" ] || [ -z "$new_status" ]; then
        echo -e "${RED}Error: Task ID and status required${NC}"
        return 1
    fi
    
    # Check if task exists
    if ! jq -e --arg id "$task_id" '.tags.master.tasks[] | select(.id == $id)' "$TASKS_FILE" > /dev/null; then
        echo -e "${RED}Error: Task $task_id not found${NC}"
        return 1
    fi
    
    # Update the task
    current_time=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    jq --arg id "$task_id" --arg status "$new_status" --arg time "$current_time" '.tags.master.tasks |= map(
        if .id == $id then 
            .status = $status | .updated = $time
        else . 
        end
    )' "$TASKS_FILE" > "$TEMP_FILE" && mv "$TEMP_FILE" "$TASKS_FILE"
    
    echo -e "${GREEN}✅ Task $task_id status updated to: $new_status${NC}"
}

# Show project status
show_status() {
    echo -e "${BLUE}📊 Project Status Summary${NC}"
    echo ""
    
    total=$(jq '.tags.master.tasks | length' "$TASKS_FILE")
    completed=$(jq '[.tags.master.tasks[] | select(.status == "completed")] | length' "$TASKS_FILE")
    in_progress=$(jq '[.tags.master.tasks[] | select(.status == "in-progress")] | length' "$TASKS_FILE")
    pending=$(jq '[.tags.master.tasks[] | select(.status == "pending")] | length' "$TASKS_FILE")
    blocked=$(jq '[.tags.master.tasks[] | select(.status == "blocked")] | length' "$TASKS_FILE")
    
    high_priority=$(jq '[.tags.master.tasks[] | select(.priority == "high" and .status != "completed")] | length' "$TASKS_FILE")
    
    echo -e "Total Tasks: ${BLUE}$total${NC}"
    echo -e "Completed: ${GREEN}$completed${NC}"
    echo -e "In Progress: ${YELLOW}$in_progress${NC}"
    echo -e "Pending: ${CYAN}$pending${NC}"
    echo -e "Blocked: ${RED}$blocked${NC}"
    echo ""
    echo -e "High Priority Remaining: ${PURPLE}$high_priority${NC}"
    
    if [ "$completed" -gt 0 ] && [ "$total" -gt 0 ]; then
        percentage=$((completed * 100 / total))
        echo -e "Progress: ${GREEN}$percentage%${NC}"
    fi
}

# Show task dependencies
show_dependencies() {
    local task_id="$1"
    if [ -z "$task_id" ]; then
        echo -e "${RED}Error: Task ID required${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🔗 Dependencies for Task $task_id${NC}"
    echo ""
    
    # Get task dependencies
    deps=$(jq -r --arg id "$task_id" '.tags.master.tasks[] | select(.id == $id) | .dependencies[]?' "$TASKS_FILE")
    
    if [ -z "$deps" ]; then
        echo -e "${GREEN}No dependencies${NC}"
        return 0
    fi
    
    echo "$deps" | while read -r dep_id; do
        dep_info=$(jq -r --arg id "$dep_id" '.tags.master.tasks[] | select(.id == $id) | 
            "\(.id): \(.title) (Status: \(.status))"' "$TASKS_FILE")
        
        if [[ $dep_info == *"Status: completed"* ]]; then
            echo -e "${GREEN}✅ $dep_info${NC}"
        else
            echo -e "${RED}❌ $dep_info${NC}"
        fi
    done
}

# Main script logic
main() {
    check_jq
    check_tasks_file
    
    case "$1" in
        "list")
            list_tasks
            ;;
        "list-pending")
            list_pending
            ;;
        "list-high")
            list_high
            ;;
        "next")
            next_task
            ;;
        "show")
            show_task "$2"
            ;;
        "start")
            update_task_status "$2" "in-progress"
            ;;
        "complete")
            update_task_status "$2" "completed"
            ;;
        "block")
            update_task_status "$2" "blocked"
            ;;
        "status")
            show_status
            ;;
        "dependencies")
            show_dependencies "$2"
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            echo -e "${RED}Unknown command: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run the main function with all arguments
main "$@" 