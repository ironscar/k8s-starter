package com.k8s.springweb.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.k8s.springweb.domain.Task;
import com.k8s.springweb.repository.TaskRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api")
public class TaskController {

    private final TaskRepository taskRepository;

    @Autowired
    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @GetMapping("/demo")
    public String demo() {
        return "Hello from Kubernetes Spring Boot!";
    }

    @GetMapping("/tasks")
    public List<Task> getTasks(@RequestParam(defaultValue = "10") Integer limit) {
        return taskRepository.findAll(limit);
    }

    @PostMapping("/tasks")
    public Task createTask(@RequestBody Task task) {
        return taskRepository.insert(task.getTitle());
    }

    @PutMapping("tasks/{id}")
    public Task updateTask(@PathVariable int id, @RequestBody Task task) {
        if (task == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "request body cannot be null");
        }
        return taskRepository.update(id, task);
    }

    @DeleteMapping("tasks/{id}")
    public void deleteTask(@PathVariable int id) {
        int deletedCount = taskRepository.delete(id);
        if (deletedCount == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found");
        }
    }

}
