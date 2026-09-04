package com.k8s.springweb.repository;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import com.k8s.springweb.domain.Task;

@Repository
public interface TaskRepository {

    List<Task> findAll(@Param("limit") Integer limit);

    Task insert(@Param("title") String title);

    Task update(@Param("id") Integer id, @Param("task") Task task);

    int delete(@Param("id") Integer id);

}
